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

console.log('Firebase initialized');

// Add default status if not exists and load initial data
async function initializeAndLoadData() {
    try {
        const snapshot = await db.collection('enrollments').get();
        console.log('Checking enrollments:', snapshot.size, 'documents found');
        
        for (const doc of snapshot.docs) {
            if (!doc.data().status) {
                await doc.ref.update({ status: 'pending_review' });
                console.log('Updated status for document:', doc.id);
            }
        }

        // Load applications after initialization
        loadApplications('pending_review');
        loadApplications('approved');
        loadApplications('rejected');
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Load applications by status
function loadApplications(status) {
    console.log('Loading applications for status:', status);
    // Map status to container ID
    let containerId;
    if (status === 'pending_review') {
        containerId = 'pendingApplications';
    } else {
        containerId = `${status}Applications`;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container not found for status: ${status}, looking for ID: ${containerId}`);
        return;
    }
    
    container.innerHTML = '<p class="text-center">Loading...</p>';

    db.collection('enrollments')
        .where('status', '==', status)
        .get()
        .then((snapshot) => {
            console.log(`Found ${snapshot.size} applications for status: ${status}`);
            container.innerHTML = '';
            
            if (snapshot.empty) {
                container.innerHTML = `<p class="text-center">No ${status} applications</p>`;
                return;
            }

            snapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                console.log('Processing application:', doc.id);
                const card = document.createElement('div');
                card.className = 'application-card';
                
                // Format dates
                const enrollmentDate = data.enrollmentDate ? 
                    new Date(data.enrollmentDate.seconds * 1000).toLocaleString() : 
                    'Not available';
                  card.innerHTML = `
                    <div class="row align-items-center g-3">
                        <div class="col-md-2">
                            ${data.profilePhoto ? 
                                `<img src="${data.profilePhoto}" class="application-photo" alt="Profile photo">` :
                                `<div class="no-photo"><i class="fas fa-user"></i></div>`
                            }
                        </div>
                        <div class="col-md-7">
                            <h4>${data.firstName || 'N/A'} ${data.lastName || ''}</h4>                            <p><strong>Course:</strong> ${data.course || 'N/A'}</p>
                            <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>                            <div class="background-text">
                                <strong>Background:</strong>
                                <div class="background-content">${data.background || 'Not provided'}</div>
                            </div>
                            ${data.discounts?.evidence ? 
                                `<p><strong>Discount Evidence:</strong> <a href="#" onclick="viewEvidence('${data.discounts.evidence}'); return false;">View Evidence</a></p>` : 
                                ''
                            }
                        </div>
                        <div class="col-md-3">                            ${status === 'pending_review' ? `
                                <div class="action-buttons">
                                    <button onclick="updateStatus('${doc.id}', 'approved')" class="btn btn-success mb-2 w-100">
                                        <i class="fas fa-check me-2"></i>Approve
                                    </button>
                                    <button onclick="updateStatus('${doc.id}', 'rejected')" class="btn btn-danger w-100">
                                        <i class="fas fa-times me-2"></i>Reject
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="application-details mt-3">
                        <p><strong>Enrollment Date:</strong> ${enrollmentDate}</p>
                        <p><strong>Price:</strong> R${data.price || '0'}</p>
                        <p><strong>Study Hours:</strong> ${data.studyHours || 'Not specified'} hours/week</p>
                        <p><strong>Timezone:</strong> ${data.timezone || 'Not specified'}</p>
                        ${data.scholarshipInterest === 'yes' && data.scholarshipReason ? 
                            `<p><strong>Scholarship Reason:</strong> ${data.scholarshipReason}</p>` : 
                            ''
                        }
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error loading applications:", error);
            container.innerHTML = `<p class="text-center text-danger">Error loading ${status} applications</p>`;
        });
}

// View evidence function
function viewEvidence(evidenceUrl) {
    if (!evidenceUrl) {
        alert('No evidence file available');
        return;
    }
    window.open(evidenceUrl, '_blank');
}

// Update application status
async function updateStatus(applicationId, newStatus) {
    try {
        console.log('Updating status:', applicationId, 'to', newStatus);
        await db.collection('enrollments').doc(applicationId).update({
            status: newStatus,
            statusUpdateDate: new Date()
        });
        
        // Reload all sections
        loadApplications('pending_review');
        loadApplications('approved');
        loadApplications('rejected');
        
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating application status');
    }
}

// Initialize on page load
// Wait for Firebase to initialize before loading applications
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    // Wait for a short delay to ensure Firebase is fully initialized
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if Firebase is initialized
    if (!firebase.apps.length) {
        console.error('Firebase not initialized');
        document.getElementById('pendingApplications').innerHTML = '<p class="text-center text-danger">Error: Firebase not initialized</p>';
        return;
    }

    try {
        await initializeAndLoadData();
    } catch (error) {
        console.error('Error loading applications:', error);
        document.getElementById('pendingApplications').innerHTML = '<p class="text-center text-danger">Error loading applications. Check console for details.</p>';
    }
});