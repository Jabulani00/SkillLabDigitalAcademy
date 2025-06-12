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
    // Course selection elements
    const courseSelection = document.getElementById('courseSelection');
    const selectedCourseDisplay = document.getElementById('selected-course');
    const coursePriceDisplay = document.getElementById('course-price');
    const enrollmentForm = document.getElementById('enrollmentForm');
    
    // Get course details from URL parameters
    const params = new URLSearchParams(window.location.search);
    let courseName = decodeURIComponent(params.get('course') || '');
    let coursePrice = params.get('price');
    let discountEvidenceData = null; // Temporary storage for discount evidence

    // Handle course selection based on how user accessed the page
    if (courseName && coursePrice) {
        // User came from course page with parameters
        document.querySelector('.course-selection').style.display = 'none';
        selectedCourseDisplay.innerHTML = `<i class="fas fa-book me-2"></i>Selected Course: <span class="text-primary">${courseName}</span>`;
        coursePriceDisplay.innerHTML = `<i class="fas fa-tag me-2"></i>Price: <span class="price-highlight">R${coursePrice}</span>`;
    } else {
        // User came directly to enrollment page
        courseSelection.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if (selectedValue) {
                const [selectedCourseName, selectedCoursePrice] = selectedValue.split('|');
                courseName = selectedCourseName;
                coursePrice = selectedCoursePrice.replace('R', ''); // Remove R prefix for consistency
                
                selectedCourseDisplay.innerHTML = `<i class="fas fa-book me-2"></i>Selected Course: <span class="text-primary">${courseName}</span>`;
                coursePriceDisplay.innerHTML = `<i class="fas fa-tag me-2"></i>Price: <span class="price-highlight">${selectedCoursePrice}</span>`;
                
                // Enable the form
                enrollmentForm.style.opacity = '1';
                enrollmentForm.style.pointerEvents = 'auto';
            } else {
                courseName = '';
                coursePrice = '';
                selectedCourseDisplay.innerHTML = `<i class="fas fa-book me-2"></i>Selected Course: <span class="text-muted">Please select a course above</span>`;
                coursePriceDisplay.innerHTML = `<i class="fas fa-tag me-2"></i>Price: <span class="text-muted">-</span>`;
                
                // Disable the form
                enrollmentForm.style.opacity = '0.6';
                enrollmentForm.style.pointerEvents = 'none';
            }
        });

        // Initially disable the form until a course is selected
        enrollmentForm.style.opacity = '0.6';
        enrollmentForm.style.pointerEvents = 'none';
        selectedCourseDisplay.innerHTML = `<i class="fas fa-book me-2"></i>Selected Course: <span class="text-muted">Please select a course above</span>`;
        coursePriceDisplay.innerHTML = `<i class="fas fa-tag me-2"></i>Price: <span class="text-muted">-</span>`;
    }

    // Handle photo upload and preview with size limit
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    let photoData = null;

    photoInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1 * 1024 * 1024) { // 1MB limit
                alert('Profile photo must be less than 1MB');
                this.value = '';
                return;
            }
            
            try {
                const compressedImage = await compressImage(file);
                photoData = compressedImage;
                photoPreview.src = compressedImage;
                photoPreview.style.display = 'block';
            } catch (error) {
                console.error('Error processing image:', error);
                alert('Error processing image. Please try a different image.');
                this.value = '';
            }
        }
    });

    // Handle scholarship reason visibility
    const scholarshipSelect = document.getElementById('scholarshipInterest');
    const scholarshipReason = document.querySelector('.scholarship-reason');
    
    scholarshipSelect.addEventListener('change', function() {
        scholarshipReason.style.display = this.value === 'yes' ? 'block' : 'none';
    });

    // Handle discount evidence upload with size limit
    const discountEvidence = document.getElementById('discountEvidence');
    discountEvidence.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('Evidence file must be less than 2MB');
                this.value = '';
                return;
            }
            
            try {
                const reader = new FileReader();
                reader.onload = function(e) {
                    discountEvidenceData = e.target.result;
                };
                reader.onerror = function() {
                    alert('Error reading file. Please try again.');
                    this.value = '';
                };
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Error processing file. Please try again.');
                this.value = '';
            }
        }
    });

    // Image compression function
    async function compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions
                    const maxDim = 800;
                    if (width > height && width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    } else if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Form submission
    enrollmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

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
                price: coursePrice,
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