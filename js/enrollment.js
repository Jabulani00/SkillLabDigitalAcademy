// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT3HsLpnLH-7lhKg2hAJb7OjEnlimHNmI",
    authDomain: "ictms-backup.firebaseapp.com",
    projectId: "ictms-backup",
    storageBucket: "ictms-backup.firebasestorage.app",
    messagingSenderId: "664431354776",
    appId: "1:664431354776:web:53485eaa11090613fe81ed"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function() {
    // Get course details from URL parameters
    const params = new URLSearchParams(window.location.search);
    const courseName = params.get('course');
    const coursePrice = params.get('price');

    // Update course info in the form
    if (courseName && coursePrice) {
        document.getElementById('selected-course').textContent = `Selected Course: ${courseName}`;
        document.getElementById('course-price').textContent = `Price: R${coursePrice}`;
    }

    // Handle photo upload and preview
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');

    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    const enrollmentForm = document.getElementById('enrollmentForm');
    enrollmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Basic form validation
        if (!enrollmentForm.checkValidity()) {
            e.stopPropagation();
            enrollmentForm.classList.add('was-validated');
            return;
        }

        try {
            // Get form data            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                course: courseName,
                price: coursePrice,
                enrollmentDate: new Date(),
                status: 'pending',
                profilePhoto: photoPreview.src,
                paymentDetails: {
                    cardName: document.getElementById('cardName').value,
                    cardNumber: document.getElementById('cardNumber').value.slice(-4), // Only store last 4 digits
                    expiryDate: document.getElementById('expiry').value
                }
            };

            // Save to Firebase
            await db.collection('enrollments').add(formData);

            // Show success message
            alert('Application submitted successfully! We will review your application and contact you soon.');
            window.location.href = 'course.html'; // Redirect back to courses page

        } catch (error) {
            console.error('Error during enrollment:', error);
            alert('There was an error processing your application. Please try again.');
        }
    });

    // Card number formatting
    const cardInput = document.getElementById('cardNumber');
    cardInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    });

    // Expiry date formatting
    const expiryInput = document.getElementById('expiry');
    expiryInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    // CVV formatting
    const cvvInput = document.getElementById('cvv');
    cvvInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        e.target.value = value;
    });
});