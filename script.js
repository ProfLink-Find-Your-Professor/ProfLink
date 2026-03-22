// 1. State & Utilities
let allProfessors = [];
let fuse = null;
let currentSearchTerm = "";
let currentDeptFilter = "";
let currentRenderLimit = 20;

function calculateInitialLimit() {
    const ww = window.innerWidth;
    if (ww < 768) return 20; // Mobile: 2 cols * 10 rows
    if (ww < 1024) return 24; // Tablet (3 cols * 8 rows roughly)
    if (ww < 1280) return 24; // 3 cols * 8 rows
    if (ww < 1536) return 24; // 3 cols * 8 rows
    return 32; // 4 cols * 8 rows
}

// Initialize Supabase Client
const supabaseUrl = 'https://mouxlikiuetxbdumddpa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vdXhsaWtpdWV0eGJkdW1kZHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTU5ODIsImV4cCI6MjA4OTYzMTk4Mn0.YuT-qnKXnFKpnkixhPn4Nfa1VltR9cd9BKto8w3PLdY';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

let starredIds = new Set(JSON.parse(localStorage.getItem('proflink_starred')) || []);

function toggleStar(profId) {
    if (starredIds.has(profId)) {
        starredIds.delete(profId);
    } else {
        starredIds.add(profId);
    }
    localStorage.setItem('proflink_starred', JSON.stringify([...starredIds]));
}

async function loadData() {
    try {
        const { data, error } = await supabaseClient
            .from('professors')
            .select('*');
            
        if (error) throw error;
        allProfessors = data || [];
        
        // Initialize Fuse.js for fuzzy search
        if (typeof Fuse !== 'undefined') {
            const options = {
                keys: ['name', 'department', 'research', 'tags', 'courses_taught'],
                threshold: 0.3, // Tolerance for typos
            };
            fuse = new Fuse(allProfessors, options);
        }
    } catch (error) {
        console.error("Error loading data from Supabase:", error);
    }
}

// ----------------------------------------------------------------------
// PAGE DETECTOR
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    const isProfilePage = document.getElementById('profileSection') !== null;
    const isIndexPage = document.getElementById('searchInput') !== null;
    
    // Show skeleton if on index page
    if (isIndexPage) {
        showSkeletons();
    }
    
    await loadData();
    
    if (isProfilePage) {
        renderProfilePage();
    } else if (isIndexPage) {
        initIndexPage();
    }
});

function showSkeletons() {
    const allGrid = document.getElementById('allGrid');
    const placeholders = Array.from({length: 6}).map(() => `
        <div class="prof-card">
            <div class="card-header">
                <div class="skeleton skeleton-img" style="margin-bottom: 1rem;"></div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%; margin-top: 0.5rem; border-radius: 999px;"></div>
            </div>
            <div class="card-body" style="width: 100%;">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `).join('');
    // Remove "no results" initially when showing skeletons
    const noResultsInfo = document.getElementById('noResults');
    if(noResultsInfo) noResultsInfo.classList.add('hidden');
    allGrid.innerHTML = placeholders;
}

// ----------------------------------------------------------------------
// INDEX PAGE LOGIC
// ----------------------------------------------------------------------
function initIndexPage() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const filterToggle = document.getElementById('filterDropdownToggle');
    const deptDropdownMenu = document.getElementById('deptDropdownMenu');
    
    // Populate departments dynamically based on fetched data
    const depts = [...new Set(allProfessors.map(p => p.department))].sort();
    depts.forEach(dept => {
        const li = document.createElement('li');
        li.setAttribute('data-value', dept);
        li.textContent = dept;
        deptDropdownMenu.appendChild(li);
    });

    // Initial Render
    currentRenderLimit = calculateInitialLimit();
    renderIndexUI();
    
    // Load More Button Event
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', () => {
        currentRenderLimit += calculateInitialLimit();
        renderIndexUI();
    });

    // Search Events
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        if (currentSearchTerm.length > 0) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
        currentRenderLimit = calculateInitialLimit();
        renderIndexUI();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = "";
        currentSearchTerm = "";
        clearSearchBtn.classList.add('hidden');
        searchInput.focus();
        currentRenderLimit = calculateInitialLimit();
        renderIndexUI();
    });
    
    // Custom Dropdown Events
    filterToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        deptDropdownMenu.classList.toggle('show');
    });

    deptDropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.tagName === 'LI') {
            // Remove active class from all
            deptDropdownMenu.querySelectorAll('li').forEach(item => item.classList.remove('active'));
            // Add active class to clicked
            e.target.classList.add('active');
            
            // Set filter value
            currentDeptFilter = e.target.getAttribute('data-value');
            
            // Close menu
            deptDropdownMenu.classList.remove('show');
            
            // Render UI
            currentRenderLimit = calculateInitialLimit();
            renderIndexUI();
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        if(deptDropdownMenu.classList.contains('show')){
            deptDropdownMenu.classList.remove('show');
        }
    });
}

function renderIndexUI() {
    const allGrid = document.getElementById('allGrid');
    const starredGrid = document.getElementById('starredGrid');
    const starredSection = document.getElementById('starredSection');
    const allSection = document.getElementById('allSection');
    const noResultsInfo = document.getElementById('noResults');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    let filteredProfs = allProfessors;
    
    // Dynamic Reorder: If searching, pull results ABOVE starred grid
    if (currentSearchTerm.length > 0 || currentDeptFilter) {
        allSection.parentNode.insertBefore(allSection, starredSection);
    } else {
        allSection.parentNode.insertBefore(starredSection, allSection);
    }
    
    // 1. Fuzzy Search Evaluation
    if (currentSearchTerm && fuse) {
        const results = fuse.search(currentSearchTerm);
        filteredProfs = results.map(result => result.item);
    } else if (currentSearchTerm && !fuse) {
        // Fallback exact search
        const term = currentSearchTerm.toLowerCase();
        filteredProfs = allProfessors.filter(prof => 
            prof.name.toLowerCase().includes(term) || prof.department.toLowerCase().includes(term)
        );
    }
    
    // 2. Department Filter Evaluation
    if (currentDeptFilter) {
        filteredProfs = filteredProfs.filter(prof => prof.department === currentDeptFilter);
    }

    const starredProfs = filteredProfs.filter(prof => starredIds.has(prof.id));
    const regularProfs = filteredProfs.filter(prof => !starredIds.has(prof.id));

    if (filteredProfs.length === 0) {
        noResultsInfo.classList.remove('hidden');
        allGrid.innerHTML = "";
        starredGrid.innerHTML = "";
        starredSection.classList.add('hidden');
        return;
    } else {
        noResultsInfo.classList.add('hidden');
    }

    if (starredProfs.length > 0) {
        starredSection.classList.remove('hidden');
        starredGrid.innerHTML = starredProfs.map(prof => createCardHTML(prof, true)).join('');
    } else {
        starredSection.classList.add('hidden');
        starredGrid.innerHTML = "";
    }

    // Slice for pagination
    const paginatedProfs = regularProfs.slice(0, currentRenderLimit);
    
    if (regularProfs.length > currentRenderLimit && loadMoreBtn) {
        loadMoreBtn.classList.remove('hidden');
    } else if (loadMoreBtn) {
        loadMoreBtn.classList.add('hidden');
    }

    allGrid.innerHTML = paginatedProfs.map(prof => createCardHTML(prof, false)).join('');

    // Attach event listeners for navigation and starring
    document.querySelectorAll('.prof-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent navigating if the user clicked the star button
            if (e.target.closest('.star-btn')) {
                const btn = e.target.closest('.star-btn');
                const profId = btn.getAttribute('data-id');
                btn.style.transform = "scale(0.8)";
                setTimeout(() => {
                    toggleStar(profId);
                    renderIndexUI(); // Re-render to update arrays
                }, 100);
                return;
            }
            // Otherwise, navigate to profile
            const profId = e.currentTarget.getAttribute('data-id');
            window.location.href = `professor.html?id=${profId}`;
        });
    });
}

function createCardHTML(prof, isStarred) {
    const starIconClass = isStarred ? "fa-solid" : "fa-regular";
    const starBtnClass = isStarred ? "active" : "";

    let subTitle = prof.occupation || "";
    if (prof.school && prof.school !== "null" && prof.school.trim() !== "") {
        subTitle += ` • ${prof.school}`;
    } else if (prof.department && prof.department !== "null" && prof.department.trim() !== "") {
        subTitle += ` • ${prof.department}`;
    } else if (prof.qualifications && prof.qualifications.trim() !== "") {
        subTitle += ` • ${prof.qualifications}`;
    }

    return `
        <div class="prof-card" data-id="${prof.id}">
            <div class="card-header">
                <div class="prof-img-wrap">
                    <img src="${prof.image}" alt="${prof.name}" class="prof-img" loading="lazy">
                    <button class="star-btn ${starBtnClass}" data-id="${prof.id}" aria-label="${isStarred ? 'Unstar' : 'Star'} professor">
                        <i class="${starIconClass} fa-star"></i>
                    </button>
                </div>
                <h3 class="prof-name">${prof.name}</h3>
                <p class="prof-title">${subTitle}</p>
                <span class="dept-badge">${prof.department}</span>
            </div>
            
            <div class="card-body">
                <div class="info-row">
                    <div class="info-icon"><i class="fa-solid fa-door-open"></i></div>
                    <div class="info-content">
                        <span class="info-label">Cabin</span>
                        <span class="info-text">${prof.cabin}</span>
                    </div>
                </div>
                
                <div class="info-row">
                    <div class="info-icon"><i class="fa-solid fa-envelope"></i></div>
                    <div class="info-content">
                        <span class="info-label">Email</span>
                        <a href="mailto:${prof.mail}" class="info-text" style="word-break: break-all;">${prof.mail}</a>
                    </div>
                </div>
                
                ${prof.contact && !prof.contact.toLowerCase().includes('not provided') ? `
                <div class="info-row">
                    <div class="info-icon"><i class="fa-solid fa-phone"></i></div>
                    <div class="info-content">
                        <span class="info-label">Contact</span>
                        <a href="tel:${prof.contact}" class="info-text">${prof.contact}</a>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ----------------------------------------------------------------------
// PROFILE PAGE LOGIC
// ----------------------------------------------------------------------
function renderProfilePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const profId = urlParams.get('id');

    if (!profId) {
        window.location.href = 'index.html';
        return;
    }

    const prof = allProfessors.find(p => p.id === profId);

    if (!prof) {
        document.getElementById('profileSection').innerHTML = '<div class="no-results">Professor not found.</div>';
        return;
    }

    // Populate Sidebar
    document.getElementById('profImage').src = prof.image;
    document.getElementById('profName').textContent = prof.name;
    document.getElementById('profTitle').textContent = `${prof.occupation} in ${prof.school || prof.department}`;

    // Status of Star Button
    const starBtn = document.getElementById('profileStarBtn');
    const starIcon = document.getElementById('profileStarIcon');
    const starText = document.getElementById('profileStarText');

    function updateStarUI() {
        if (starredIds.has(prof.id)) {
            starBtn.classList.add('active');
            starIcon.className = 'fa-solid fa-star';
            if (starText) starText.textContent = 'Starred';
        } else {
            starBtn.classList.remove('active');
            starIcon.className = 'fa-regular fa-star';
            if (starText) starText.textContent = 'Star Profile';
        }
    }
    updateStarUI();

    starBtn.addEventListener('click', () => {
        toggleStar(prof.id);
        updateStarUI();
    });

    // Populate Sidebar Contacts
    const deptInfo = document.getElementById('profDepartmentInfo');
    if (deptInfo) deptInfo.textContent = prof.department;
    document.getElementById('profCabin').textContent = prof.cabin;
    document.getElementById('profMail').textContent = prof.mail;
    document.getElementById('profMail').href = `mailto:${prof.mail}`;
    
    const contactElem = document.getElementById('profContact');
    if (prof.contact && !prof.contact.toLowerCase().includes('not provided')) {
        contactElem.textContent = prof.contact;
        contactElem.href = `tel:${prof.contact}`;
        contactElem.closest('.info-row').classList.remove('hidden');
    } else {
        contactElem.closest('.info-row').classList.add('hidden');
    }

    // Populate Main Content
    document.getElementById('profBio').textContent = prof.bio;

    const educationList = document.getElementById('profEducation');
    if (prof.qualifications && prof.qualifications.trim() !== '') {
        const quals = prof.qualifications.split(',').map(q => q.trim()).filter(q => q !== "");
        if (quals.length > 0) {
            educationList.innerHTML = quals.map(edu => `
                <li><i class="fa-solid fa-graduation-cap"></i> ${edu}</li>
            `).join('');
        } else {
            educationList.innerHTML = '<li><i class="fa-solid fa-graduation-cap"></i> Details Not Provided Online</li>';
        }
    } else {
        educationList.innerHTML = '<li><i class="fa-solid fa-graduation-cap"></i> Details Not Provided Online</li>';
    }

    const researchContainer = document.getElementById('profResearch');
    if (prof.research && prof.research.length > 0) {
        researchContainer.innerHTML = prof.research.map(req => `
            <span class="tag">${req}</span>
        `).join('');
    }

    // AI Compose Logic
    const aiComposeBtn = document.getElementById('aiComposeBtn');
    const aiModal = document.getElementById('aiModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const generateEmailBtn = document.getElementById('generateEmailBtn');
    const studentNameInput = document.getElementById('studentName');
    const studentEmailInput = document.getElementById('studentEmail');
    const studentRollInput = document.getElementById('studentRoll');
    const studentSectionInput = document.getElementById('studentSection');
    const emailPromptInput = document.getElementById('emailPrompt');

    if (prof.mail && prof.mail !== 'Not Provided Online') {
        aiComposeBtn.classList.remove('hidden');
    }
    
    let isPreviewMode = false;
    let generatedSubject = "Inquiry";

    aiComposeBtn.addEventListener('click', () => {
        aiModal.classList.remove('hidden');
        isPreviewMode = false;
        generateEmailBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate AI Preview';
        emailPromptInput.placeholder = 'e.g. Need permission to join your research project...';
        emailPromptInput.value = '';
        emailPromptInput.rows = 3;
        emailPromptInput.previousElementSibling.innerText = "What is the email about?";
        
        // Restore from local storage
        studentNameInput.value = localStorage.getItem('proflink_student_name') || '';
        studentEmailInput.value = localStorage.getItem('proflink_student_email') || '';
        studentRollInput.value = localStorage.getItem('proflink_student_roll') || '';
        studentSectionInput.value = localStorage.getItem('proflink_student_section') || '';
    });

    closeModalBtn.addEventListener('click', () => {
        aiModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === aiModal) aiModal.classList.add('hidden');
    });

    generateEmailBtn.addEventListener('click', async () => {
        if (isPreviewMode) {
            // Already generated, now actually send via Outlook (the user could have edited it)
            const finalBody = emailPromptInput.value.trim();
            const subject = encodeURIComponent(generatedSubject);
            const body = encodeURIComponent(finalBody);
            
            const mailtoLink = `mailto:${prof.mail}?subject=${subject}&body=${body}`;
            window.location.href = mailtoLink;
            
            aiModal.classList.add('hidden');
            return;
        }
        
        const studentName = studentNameInput.value.trim();
        const studentEmail = studentEmailInput.value.trim();
        const studentRoll = studentRollInput.value.trim();
        const studentSection = studentSectionInput.value.trim();
        const promptInfo = emailPromptInput.value.trim();

        if (!studentName || !studentEmail || !promptInfo) {
            alert('Please provide at least your Name, Email, and what the email is about.');
            return;
        }

        // Save for next time
        localStorage.setItem('proflink_student_name', studentName);
        localStorage.setItem('proflink_student_email', studentEmail);
        localStorage.setItem('proflink_student_roll', studentRoll);
        localStorage.setItem('proflink_student_section', studentSection);

        generateEmailBtn.disabled = true;
        generateEmailBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

        try {
            const apiKey = window.atob("QUl6YVN5QzFweldqRU9UYW1kdS1nRXVKaUFwRWtYdTNPZllWd3BJ");
            // The API key only supports the futuristic models
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            const systemInstruction = `You are an assistant helping a student write a professional, polite, and concise email to their professor. 
            Professor Name: ${prof.name}
            Professor Title: ${prof.occupation}
            Professor Department: ${prof.department}
            Student Name: ${studentName}
            Student Email: ${studentEmail}
            Student Roll/Reg No: ${studentRoll || 'N/A'}
            Student Section: ${studentSection || 'N/A'}`;

            const userPrompt = `Write an email to Professor ${prof.name} regarding: ${promptInfo}. Keep it strictly professional, well-formatted, and concise. Only output the email body to be used in a mailto link body, no subject line, no extra conversational text. Sign it off properly with the student's name, roll no, and section if provided. Start immediately with Dear Professor...`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemInstruction + '\n\n' + userPrompt }] }]
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Status: ${response.status} - ${errText}`);
            }
            
            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
                throw new Error('Invalid JSON format received from Gemini: ' + JSON.stringify(data));
            }
            
            let generatedBody = data.candidates[0].content.parts[0].text;
            
            // Clean up Markdown formatting
            generatedBody = generatedBody.replace(/\*\*/g, '').replace(/\*/g, '');
            
            // Show preview in the prompt input field
            const rawSubject = promptInfo.split('\n')[0].substring(0, 40);
            generatedSubject = `Regarding ${rawSubject}...`;
            
            emailPromptInput.value = generatedBody;
            emailPromptInput.rows = 8;
            emailPromptInput.previousElementSibling.innerText = "Review your generated email carefully:";
            
            // Switch state to preview mode
            isPreviewMode = true;
            generateEmailBtn.innerHTML = '<i class="fa-solid fa-envelope-open-text"></i> Open in Outlook';
            
        } catch (error) {
            console.error("Gemini Generation Error:", error);
            alert("Failed to generate email. Error: " + error.message);
            generateEmailBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate AI Preview';
        } finally {
            generateEmailBtn.disabled = false;
        }
    });
}

