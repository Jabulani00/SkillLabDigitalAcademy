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
    const courseMapping = {
        'quickstart': { name: 'Quick Start', price: '1800', duration: '8 weeks' },
        'developer': { name: 'Developer Track', price: '2400', duration: '12 weeks' },
        'pro': { name: 'Professional', price: '2900', duration: '16 weeks' },
        'enterprise': { name: 'Enterprise', price: '3400', duration: '20 weeks' },
        'environment': { name: 'Development Environment', price: '500', duration: '2 weeks' },
        'ai': { name: 'AI Integration', price: '900', duration: '4 weeks' },
        'rapid': { name: 'Rapid Development', price: '900', duration: '4 weeks' }
    };

    // Get bundle/course and price from URL parameters
    const params = new URLSearchParams(window.location.search);
    const bundle = params.get('bundle');
    const price = params.get('price');

    // Set initial course selection based on bundle parameter
    if (bundle && courseMapping[bundle]) {
        const course = courseMapping[bundle];
        
        // Hide course selection if coming from a specific bundle
        document.querySelector('.course-selection').style.display = 'none';
        
        // Update displays
        const selectedCourseDisplay = document.getElementById('selected-course');
        const coursePriceDisplay = document.getElementById('course-price');
        
        selectedCourseDisplay.innerHTML = `<i class="fas fa-book me-2"></i>Selected Course: <span class="text-primary">${course.name} (${course.duration})</span>`;
        coursePriceDisplay.innerHTML = `<i class="fas fa-tag me-2"></i>Price: <span class="price-highlight">R${course.price}</span>`;
        
        // Store values for form submission
        window.selectedCourse = {
            name: course.name,
            price: course.price,
            duration: course.duration
        };
        
        // Enable the form
        const enrollmentForm = document.getElementById('enrollmentForm');
        enrollmentForm.style.opacity = '1';
        enrollmentForm.style.pointerEvents = 'auto';
    }

    // Course selection change handler
    const courseSelection = document.getElementById('courseSelection');
    courseSelection.addEventListener('change', function() {
        const selectedValue = this.value;
        const [courseName, coursePrice] = selectedValue.split('|');
        
        if (selectedValue) {
            const selectedCourseDisplay = document.getElementById('selected-course');
            const coursePriceDisplay = document.getElementById('course-price');
            
            selectedCourseDisplay.innerHTML = `<i class="fas fa-book me-2"></i>Selected Course: <span class="text-primary">${courseName}</span>`;
            coursePriceDisplay.innerHTML = `<i class="fas fa-tag me-2"></i>Price: <span class="price-highlight">R${coursePrice}</span>`;
            
            // Store values for form submission
            window.selectedCourse = {
                name: courseName,
                price: coursePrice
            };
            
            // Enable form
            const enrollmentForm = document.getElementById('enrollmentForm');
            enrollmentForm.style.opacity = '1';
            enrollmentForm.style.pointerEvents = 'auto';
        }
    });

    // Update form submission to use stored course values
    const enrollmentForm = document.getElementById('enrollmentForm');
    enrollmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!window.selectedCourse) {
            alert('Please select a course before submitting.');
            return;
        }

        // Check if course is selected (for direct access users)
        if (!courseName || !coursePrice) {
            alert('Please select a course before submitting your application.');
            return;
        }

        // Basic form validation
        if (!enrollmentForm.checkValidity()) {
            e.stopPropagation();
            enrollmentForm.classList.add('was-validated');
            return;
        }

        // Check scholarship reason if applying for scholarship
        if (document.getElementById('scholarshipInterest').value === 'yes' && 
            !document.getElementById('scholarshipReason').value.trim()) {
            alert('Please provide a reason for your scholarship application');
            return;
        }

        const finalPrice = calculateDiscount(parseInt(coursePrice));
        
        try {
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                idType: document.getElementById('idType').value,
                idNumber: document.getElementById('idNumber').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                gender: document.getElementById('gender').value,
                nationality: document.getElementById('nationality').value,
                course: courseName,
                originalPrice: parseInt(coursePrice),
                finalPrice: finalPrice,
                enrollmentDate: new Date(),
                status: 'pending_review',
                profilePhoto: photoData,
                background: document.getElementById('background').value,
                passion: document.getElementById('passion').value,
                hasComputer: document.getElementById('hasComputer').checked,
                hasInternet: document.getElementById('hasInternet').checked,
                commitment: document.getElementById('commitment').value,
                studyHours: document.getElementById('studyHours').value,
                timezone: document.getElementById('timezone').value,
                preferredTime: document.getElementById('preferredTime').value,
                onlineExperience: document.getElementById('onlineExperience').value,
                englishProficiency: document.getElementById('englishProficiency').value,
                learningStyle: document.getElementById('learningStyle').value,
                goals: document.getElementById('goals').value,
                specialRequirements: document.getElementById('specialRequirements').value,
                discounts: {
                    isStudent: document.getElementById('isStudent').checked,
                    isGroupEnrollment: document.getElementById('isGroupEnrollment').checked,
                    isNGO: document.getElementById('isNGO').checked,
                    evidence: discountEvidenceData
                },
                scholarshipInterest: document.getElementById('scholarshipInterest').value,
                scholarshipReason: document.getElementById('scholarshipReason').value
            };

            // Save to Firebase with retry logic
            let retries = 3;
            while (retries > 0) {
                try {
                    await db.collection('enrollments').add(formData);
                    break;
                } catch (error) {
                    retries--;
                    if (retries === 0) throw error;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }

            // Show success message
            alert('Your application has been submitted successfully! We will review your application and send you an email with the acceptance status and payment details.');
            window.location.href = 'index.html'; // Redirect to home page

        } catch (error) {
            console.error('Error during enrollment:', error);
            alert('There was an error processing your application. Please try again or contact support if the problem persists.');
        }
    });
});