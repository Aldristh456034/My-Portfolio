(function() {
    // ================================================================
    // PROJECT DATA - All your projects defined here
    // Images are auto-detected from the folder (preview1.png, preview2.png, etc.)
    // ================================================================
    const projectConfigs = [
        // ===== DESKTOP DEVELOPMENT =====
        {
            id: 'grading-system',
            title: 'Grading System',
            category: 'desktop',
            shortDesc: 'Enables creation of subjects, students, and grading per student.',
            longDesc: 'Enables creation of subjects, students, and grading per student. Built with C# and MongoDB for efficient data management.\n\nFeatures:\n• Subject management (add, edit, delete)\n• Student enrollment and records\n• Grade entry with automatic computation\n• Report generation (PDF/Excel)\n• User authentication with role-based access\n• Audit trail for all changes',
            tech: ['C#', 'MongoDB'],
            github: 'https://github.com/aldristh456034/grading-system',
            folder: 'DesktopDev/GradingSystem/'
        },
        {
            id: 'banking-system',
            title: 'Banking System',
            category: 'desktop',
            shortDesc: 'Admin & user software with OTP, facial recognition, multi-language, and account management.',
            longDesc: 'Admin & user software with OTP, facial recognition, multi-language support, account management, and printing. Built with C#, SQLServer, and C++.\n\nKey Features:\n• Separate interfaces for Administrator and User\n• Account approval workflow\n• Transaction history with filters\n• Multi-language support (English, Filipino, Spanish)\n• Security: Email verification, OTP, Security Key, Facial Recognition\n• Account management with deactivation\n• Printable transaction summaries',
            tech: ['C#', 'SQLServer', 'C++'],
            github: 'https://github.com/aldristh456034/banking-system',
            folder: 'DesktopDev/BankingSystem/'
        },
        {
            id: 'pos-inventory',
            title: 'Point of Sale & Inventory',
            category: 'desktop',
            shortDesc: 'Cashier & admin interface with inventory, pricing, and reports.',
            longDesc: 'Cashier & admin interface with inventory, pricing, and reports. Built with Java 16, UCanAccess, and Microsoft Access.\n\nFeatures:\n• Cashier mode: fast checkout with barcode support\n• Admin dashboard: inventory overview\n• Product management (add, update, delete)\n• Real-time stock tracking\n• Sales reports and analytics\n• User account creation for staff\n• Low stock alerts',
            tech: ['Java', 'UCanAccess', 'MS Access'],
            github: 'https://github.com/aldristh456034/pos-inventory',
            folder: 'DesktopDev/POS/'
        },
        {
            id: 'tabulation-system',
            title: 'Tabulation System',
            category: 'desktop',
            shortDesc: 'Fast-paced pageantry scoring with import/export of data.',
            longDesc: 'Fast-paced pageantry scoring with import/export of data. Built with C# and Excel integration.\n\nUsed in a school pageantry event at Camarines Sur.\n\nFeatures:\n• Real-time scoring for judges\n• Automatic calculation and ranking\n• Import/export of criteria and scores via Excel\n• Live leaderboard display\n• Tie-breaking logic\n• Print certificates and results',
            tech: ['C#', 'Excel'],
            github: 'https://github.com/aldristh456034/tabulation-system',
            folder: 'DesktopDev/Tabulation/'
        },
        {
            id: 'payroll-system',
            title: 'Payroll System',
            category: 'desktop',
            shortDesc: 'Admin system for reports, accounts, and salary management.',
            longDesc: 'Admin system for reports, accounts, and salary management. Built with C# and SQL.\n\nFeatures:\n• Employee database management\n• Salary computation with deductions\n• Generate payslips (PDF)\n• Attendance and leave tracking\n• Role-based access for HR and employees\n• Comprehensive reports (monthly, yearly)\n• Tax computation support',
            tech: ['C#', 'SQL'],
            github: 'https://github.com/aldristh456034/payroll-system',
            folder: 'DesktopDev/Payroll/'
        },
        // ===== WEB DEVELOPMENT =====
        {
            id: 'scheduling-system',
            title: 'Class Scheduling System',
            category: 'web',
            shortDesc: 'Room allocation & conflict detection for instructors and classrooms. Includes printing.',
            longDesc: 'Room allocation & conflict detection for instructors and classrooms. Includes printing. Built with HTML, JavaScript, Bootstrap, Python, and SQL.\n\nFeatures:\n• Automatic detection of allocation conflicts\n• Room, instructor, and time management\n• Prevent duplication and confusion\n• Interactive calendar view\n• Printable schedules\n• Export to PDF',
            tech: ['HTML', 'JavaScript', 'Bootstrap', 'Python', 'SQL'],
            github: 'https://github.com/aldristh456034/scheduling-system',
            folder: 'WebDev/Scheduling/'
        },
        // ===== GAME DEVELOPMENT =====
        {
            id: 'karting-game',
            title: 'Karting Game',
            category: 'game',
            shortDesc: 'A typical kart racing game built with Unity and C#.',
            longDesc: 'A typical kart racing game built with Unity and C#.\n\nGame Mechanics:\n• Multiple tracks with obstacles\n• Power-ups (speed boost, shield)\n• AI opponents with varying difficulty\n• Time trial and race modes\n• Customizable kart colors\n• Leaderboard with best lap times',
            tech: ['Unity', 'C#'],
            github: 'https://github.com/aldristh456034/karting-game',
            folder: 'GameDev/Karting/'
        },
        // ===== ANDROID DEVELOPMENT =====
        {
            id: 'guess-gibberish',
            title: 'Guess the Gibberish',
            category: 'android',
            shortDesc: 'Guess IT-related words from invented gibberish across multiple difficulty levels.',
            longDesc: 'Guess IT-related words from invented gibberish across multiple difficulty levels. Built with Java for Android Studio.\n\nGame Features:\n• Multiple difficulty levels (Easy, Medium, Hard)\n• IT-related word categories\n• Hints and timer system\n• Score tracking and high scores\n• Sound effects and animations\n• Offline play support',
            tech: ['Java', 'Android Studio'],
            github: 'https://github.com/aldristh456034/guess-gibberish',
            folder: 'AndroidDev/Gibberish/'
        },
        // ===== GRAPHICS DESIGN =====
        {
            id: 'malabago-logo',
            title: 'Barangay Malabago Logo',
            category: 'graphics',
            shortDesc: 'Contest-winning logo for Barangay Malabago, Mangaldan.',
            longDesc: 'Contest-winning logo for Barangay Malabago, Mangaldan. Created with Adobe Illustrator.\n\nDesign Elements:\n• Local cultural symbols\n• Modern and clean aesthetic\n• Versatile for various applications (print, digital)\n• Selected as official barangay logo',
            tech: ['Adobe Illustrator'],
            github: 'https://github.com/aldristh456034/malabago-logo',
            folder: 'GraphicsDesign/Malabago/'
        },
        {
            id: 'council-logo',
            title: 'Student Council Logo',
            category: 'graphics',
            shortDesc: 'Official renewed logo for the College Student Council.',
            longDesc: 'Official renewed logo for the College Student Council. Created with Adobe Illustrator.\n\nDesign Approach:\n• Modern refresh of existing council identity\n• Symbolism of unity and leadership\n• Color palette representing the institution\n• Used across all council materials and merchandise',
            tech: ['Adobe Illustrator'],
            github: 'https://github.com/aldristh456034/student-council-logo',
            folder: 'GraphicsDesign/Council/'
        },
        {
            id: 'arise-logo',
            title: 'Arise Guild Logo',
            category: 'graphics',
            shortDesc: 'Guild logo for a mobile gaming community.',
            longDesc: 'Guild logo for a mobile gaming community. Created with Adobe Illustrator.\n\nDesign Features:\n• Epic fantasy theme\n• Recognizable icon for in-game use\n• Scalable for different sizes (avatar, banner)\n• Color scheme matching guild identity',
            tech: ['Adobe Illustrator'],
            github: 'https://github.com/aldristh456034/arise-guild-logo',
            folder: 'GraphicsDesign/Arise/'
        }
    ];

    // ----- Auto-detect images from folder -----
    function detectImages(folder, callback) {
        const images = [];
        let found = false;
        let checked = 0;
        const maxAttempts = 20;

        function checkImage(index) {
            if (index > maxAttempts) {
                callback(images);
                return;
            }
            const imgPath = folder + 'preview' + index + '.png';
            const img = new Image();
            
            const timeout = setTimeout(() => {
                img.src = '';
                if (found && index > 1) {
                    callback(images);
                    return;
                }
                if (!found && index > 3) {
                    callback(images);
                    return;
                }
                checkImage(index + 1);
            }, 600);

            img.onload = function() {
                clearTimeout(timeout);
                images.push(imgPath);
                found = true;
                checkImage(index + 1);
            };
            img.onerror = function() {
                clearTimeout(timeout);
                if (found && index > 1) {
                    callback(images);
                    return;
                }
                if (!found && index > 3) {
                    callback(images);
                    return;
                }
                checkImage(index + 1);
            };
            img.src = imgPath;
        }
        
        // Start checking from index 1
        checkImage(1);

        // Safety timeout
        setTimeout(() => {
            if (images.length === 0 && !found) {
                callback([]);
            }
        }, 3000);
    }

    // ----- Build complete project data with images -----
    let projectsData = [];
    let loadedCount = 0;
    const totalProjects = projectConfigs.length;

    projectConfigs.forEach((config, index) => {
        detectImages(config.folder, (images) => {
            projectsData[index] = {
                id: config.id,
                title: config.title,
                category: config.category,
                shortDesc: config.shortDesc,
                longDesc: config.longDesc,
                tech: config.tech,
                github: config.github,
                folder: config.folder,
                images: images
            };
            loadedCount++;
            
            // When all projects have their images detected, render
            if (loadedCount === totalProjects) {
                console.log('✅ All projects loaded with images!');
                renderAllProjects();
            }
        });
    });

    // Fallback: If some projects don't load images, render anyway
    setTimeout(() => {
        if (loadedCount < totalProjects) {
            console.warn('⚠️ Some projects may not have images detected, rendering anyway...');
            projectConfigs.forEach((config, index) => {
                if (!projectsData[index]) {
                    projectsData[index] = {
                        id: config.id,
                        title: config.title,
                        category: config.category,
                        shortDesc: config.shortDesc,
                        longDesc: config.longDesc,
                        tech: config.tech,
                        github: config.github,
                        folder: config.folder,
                        images: []
                    };
                    loadedCount++;
                    if (loadedCount === totalProjects) {
                        renderAllProjects();
                    }
                }
            });
        }
    }, 4000);

    // ----- Render cards -----
    function renderAllProjects() {
        const categories = {
            desktop: 'desktop-grid',
            web: 'web-grid',
            game: 'game-grid',
            android: 'android-grid',
            graphics: 'graphics-grid'
        };

        Object.keys(categories).forEach(cat => {
            const grid = document.getElementById(categories[cat]);
            if (!grid) return;
            grid.innerHTML = '';
            
            const projects = projectsData.filter(p => p.category === cat);
            if (projects.length === 0) {
                grid.innerHTML = '<div class="loading-text">No projects in this category.</div>';
                return;
            }
            projects.forEach((project, idx) => {
                const card = createProjectCard(project);
                grid.appendChild(card);
            });
        });
    }

    // ----- Create a project card -----
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card card';

        const previewDiv = document.createElement('div');
        previewDiv.className = 'preview-img';
        
        if (project.images && project.images.length > 0) {
            const img = document.createElement('img');
            img.src = project.images[0];
            img.alt = project.title;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.onerror = function() {
                previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${project.title}</span>`;
            };
            previewDiv.appendChild(img);
        } else {
            previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${project.title}</span>`;
        }
        card.appendChild(previewDiv);

        const title = document.createElement('h3');
        title.textContent = project.title;
        card.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = project.shortDesc;
        card.appendChild(desc);

        const meta = document.createElement('div');
        meta.className = 'meta';
        const wrapper = document.createElement('div');
        wrapper.className = 'tech-wrapper';
        if (Array.isArray(project.tech)) {
            project.tech.forEach(t => {
                const span = document.createElement('span');
                span.className = 'tech';
                span.textContent = t;
                wrapper.appendChild(span);
            });
        }
        meta.appendChild(wrapper);
        card.appendChild(meta);

        // Store project index for modal
        const projectIndex = projectsData.indexOf(project);
        card.dataset.index = projectIndex;

        card.addEventListener('click', function() {
            openModal(parseInt(this.dataset.index));
        });

        return card;
    }

    // ----- Modal functionality -----
    const modalOverlay = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const modalGitHub = document.getElementById('modalGitHubLink');
    const modalImg = document.getElementById('modalImage');
    const modalPlaceholder = document.getElementById('modalImagePlaceholder');
    const prevBtn = document.getElementById('modalPrev');
    const nextBtn = document.getElementById('modalNext');
    const closeBtn = document.getElementById('modalCloseBtn');

    let currentProjectIndex = 0;
    let currentImageIndex = 0;
    let currentProject = null;

    function openModal(index) {
        const data = projectsData[index];
        if (!data) return;
        currentProjectIndex = index;
        currentProject = data;
        currentImageIndex = 0;

        modalTitle.textContent = data.title;
        modalDesc.innerHTML = `<strong>Description:</strong>\n${data.longDesc}`;
        modalGitHub.href = data.github || '#';

        modalContent.scrollTop = 0;
        showImage(0);
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function showImage(index) {
        if (!currentProject) return;
        const images = currentProject.images || [];
        if (images.length === 0) {
            modalImg.style.display = 'none';
            modalPlaceholder.style.display = 'flex';
            modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>no preview</span>`;
            return;
        }
        const safeIndex = index % images.length;
        const url = images[safeIndex];
        if (url) {
            modalImg.src = url;
            modalImg.style.display = 'block';
            modalPlaceholder.style.display = 'none';
            modalImg.onerror = function() {
                modalImg.style.display = 'none';
                modalPlaceholder.style.display = 'flex';
                modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>image not found</span>`;
            };
        } else {
            modalImg.style.display = 'none';
            modalPlaceholder.style.display = 'flex';
            modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>preview</span>`;
        }
    }

    function nextImage() {
        if (!currentProject) return;
        const images = currentProject.images || [];
        if (images.length === 0) return;
        currentImageIndex = (currentImageIndex + 1) % images.length;
        showImage(currentImageIndex);
    }

    function prevImage() {
        if (!currentProject) return;
        const images = currentProject.images || [];
        if (images.length === 0) return;
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        showImage(currentImageIndex);
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    prevBtn.addEventListener('click', prevImage);
    nextBtn.addEventListener('click', nextImage);
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (!modalOverlay.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });

    console.log('🚀 Portfolio loading with auto-detected images...');

})();