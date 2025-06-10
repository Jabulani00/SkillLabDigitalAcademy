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

// Load applications by status
function loadApplications(status) {
    const container = document.getElementById(`${status}Applications`);
    
    db.collection('enrollments')
        .where('status', '==', status)
        .onSnapshot((snapshot) => {
            container.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const card = document.createElement('div');
                card.className = 'application-card';
                card.innerHTML = `
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${data.profilePhoto}" class="application-photo" alt="Profile photo">
                        </div>
                        <div class="col-md-7">
                            <h4>${data.firstName} ${data.lastName}</h4>
                            <p><strong>Course:</strong> ${data.course}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Phone:</strong> ${data.phone}</p>
                        </div>
                        <div class="col-md-3">
                            ${status === 'pending' ? `
                                <div class="action-buttons">
                                    <button onclick="updateStatus('${doc.id}', 'approved')" class="button-primary mb-2 w-100">
                                        <i class="fas fa-check me-2"></i>Approve
                                    </button>
                                    <button onclick="updateStatus('${doc.id}', 'rejected')" class="btn btn-danger w-100">
                                        <i class="fas fa-times me-2"></i>Reject
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="application-details">
                        <p><strong>Enrollment Date:</strong> ${new Date(data.enrollmentDate.toDate()).toLocaleString()}</p>
                        <p><strong>Price:</strong> R${data.price}</p>
                    </div>
                `;
                container.appendChild(card);
            });
            
            if (container.innerHTML === '') {
                container.innerHTML = `<p class="text-center">No ${status} applications</p>`;
            }
        });
}

// Update application status
async function updateStatus(applicationId, newStatus) {
    try {
        await db.collection('enrollments').doc(applicationId).update({
            status: newStatus,
            statusUpdateDate: new Date()
        });
        
        // Send email notification (you would implement this)
        notifyApplicant(applicationId, newStatus);
        
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating application status');
    }
}

// Send notification to applicant (placeholder)
function notifyApplicant(applicationId, status) {
    // Implement email notification here
    console.log(`Notification sent to applicant ${applicationId}: ${status}`);
}

// Load all applications when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadApplications('pending');
    loadApplications('approved');
    loadApplications('rejected');
});