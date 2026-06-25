// ================================================================
// MODAL FUNCTIONALITY - Reads data from HTML attributes
// With Skeleton Loading Support
// ================================================================

(function() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Portfolio loading with skeletons...');
        
        // Show skeletons immediately
        renderSkeletons();
        
        // Then load real cards
        loadAllCards();
        
        // Setup modal after everything loads
        setupModal();
    }

    // ----- Render skeleton cards -----
    function renderSkeletons() {
        const categories = {
            'desktop-grid': 5,
            'web-grid': 1,
            'game-grid': 1,
            'android-grid': 1,
            'graphics-grid': 3
        };

        Object.keys(categories).forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (!grid) return;
            
            // Clear grid
            grid.innerHTML = '';
            
            // Add skeleton cards
            const count = categories[gridId];
            for (let i = 0; i < count; i++) {
                const skeleton = createSkeletonCard();
                grid.appendChild(skeleton);
            }
        });
    }

    // ----- Create a skeleton card -----
    function createSkeletonCard() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-img"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-desc"></div>
            <div class="skeleton-desc short"></div>
            <div class="skeleton-meta">
                <div class="skeleton-tech"></div>
                <div class="skeleton-tech wide"></div>
                <div class="skeleton-tech"></div>
            </div>
        `;
        return skeleton;
    }

    // ----- Load all real cards -----
    function loadAllCards() {
        const projectCards = document.querySelectorAll('.project-card');
        let loadedCount = 0;
        const totalCards = projectCards.length;

        if (totalCards === 0) {
            console.warn('No project cards found in HTML');
            return;
        }

        console.log(`Found ${totalCards} project cards to load`);

        projectCards.forEach((card, index) => {
            // Get the image element
            const img = card.querySelector('.preview-img img');
            if (!img) {
                // If no image, show card immediately
                card.style.opacity = '1';
                loadedCount++;
                if (loadedCount === totalCards) {
                    console.log('✅ All cards loaded!');
                }
                return;
            }

            // Add loading class
            const previewDiv = card.querySelector('.preview-img');
            previewDiv.classList.add('loading');

            // Check if image is already loaded
            if (img.complete && img.naturalHeight !== 0) {
                // Image already loaded
                previewDiv.classList.remove('loading');
                card.style.opacity = '1';
                loadedCount++;
                if (loadedCount === totalCards) {
                    console.log('✅ All cards loaded!');
                }
                return;
            }

            // Wait for image to load
            img.addEventListener('load', function() {
                previewDiv.classList.remove('loading');
                card.style.opacity = '1';
                loadedCount++;
                if (loadedCount === totalCards) {
                    console.log('✅ All cards loaded!');
                }
            });

            img.addEventListener('error', function() {
                // If image fails, still show the card
                previewDiv.classList.remove('loading');
                previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${card.dataset.title || 'Project'}</span>`;
                card.style.opacity = '1';
                loadedCount++;
                if (loadedCount === totalCards) {
                    console.log('✅ All cards loaded (some with errors)!');
                }
            });

            // Fallback timeout - if image takes too long, show card anyway
            setTimeout(() => {
                if (previewDiv.classList.contains('loading')) {
                    previewDiv.classList.remove('loading');
                    if (!img.src || img.src === '') {
                        previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${card.dataset.title || 'Project'}</span>`;
                    }
                    card.style.opacity = '1';
                    loadedCount++;
                    if (loadedCount === totalCards) {
                        console.log('✅ All cards loaded (timeout fallback)!');
                    }
                }
            }, 5000);
        });

        // Safety timeout - if some cards never trigger load/error
        setTimeout(() => {
            document.querySelectorAll('.project-card').forEach(card => {
                if (card.style.opacity !== '1') {
                    card.style.opacity = '1';
                    const previewDiv = card.querySelector('.preview-img');
                    if (previewDiv) previewDiv.classList.remove('loading');
                }
            });
            console.log('✅ All cards forced visible');
        }, 8000);
    }

    // ----- Setup Modal -----
    function setupModal() {
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

        let currentCard = null;
        let currentImageIndex = 0;
        let currentImages = [];
        let totalImages = 0;

        // ----- Get all images from a project folder -----
        function getProjectImages(folder) {
            const images = [];
            for (let i = 1; i <= 20; i++) {
                images.push(folder + 'preview' + i + '.png');
            }
            return images;
        }

        // ----- Detect which images actually exist -----
        function detectExistingImages(images, callback) {
            const existing = [];
            let checked = 0;
            const total = images.length;

            if (total === 0) {
                callback([]);
                return;
            }

            images.forEach((url, index) => {
                const img = new Image();
                const timeout = setTimeout(() => {
                    img.src = '';
                    checked++;
                    if (checked === total) {
                        callback(existing);
                    }
                }, 500);

                img.onload = function() {
                    clearTimeout(timeout);
                    existing.push(url);
                    checked++;
                    if (checked === total) {
                        callback(existing);
                    }
                };
                img.onerror = function() {
                    clearTimeout(timeout);
                    checked++;
                    if (checked === total) {
                        callback(existing);
                    }
                };
                img.src = url;
            });

            setTimeout(() => {
                if (checked < total) {
                    callback(existing.length > 0 ? existing : []);
                }
            }, 3000);
        }

        // ----- Open modal with card data -----
        function openModal(card) {
            currentCard = card;
            currentImageIndex = 0;

            const title = card.dataset.title || 'Project';
            const longDesc = card.dataset.longdesc || 'No description available.';
            const github = card.dataset.github || '#';

            const imgElement = card.querySelector('.preview-img img');
            let folder = '';
            if (imgElement) {
                const src = imgElement.src;
                const lastSlash = src.lastIndexOf('/');
                folder = src.substring(0, lastSlash + 1);
            }

            const allImages = getProjectImages(folder);
            
            modalTitle.textContent = title;
            modalDesc.innerHTML = `<strong>Description:</strong>\n${longDesc}`;
            modalGitHub.href = github;

            modalContent.scrollTop = 0;
            
            modalPlaceholder.style.display = 'flex';
            modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>loading...</span>`;
            modalImg.style.display = 'none';
            
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            detectExistingImages(allImages, (existing) => {
                currentImages = existing;
                totalImages = currentImages.length;
                
                if (totalImages === 0) {
                    modalImg.style.display = 'none';
                    modalPlaceholder.style.display = 'flex';
                    modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>no preview</span>`;
                    return;
                }
                
                showImage(0);
            });
        }

        function showImage(index) {
            if (totalImages === 0) {
                modalImg.style.display = 'none';
                modalPlaceholder.style.display = 'flex';
                modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>no preview</span>`;
                return;
            }
            
            const safeIndex = index % totalImages;
            const url = currentImages[safeIndex];
            
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
            if (totalImages === 0) return;
            currentImageIndex = (currentImageIndex + 1) % totalImages;
            showImage(currentImageIndex);
        }

        function prevImage() {
            if (totalImages === 0) return;
            currentImageIndex = (currentImageIndex - 1 + totalImages) % totalImages;
            showImage(currentImageIndex);
        }

        function closeModal() {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            currentImages = [];
            totalImages = 0;
            currentImageIndex = 0;
        }

        // ----- Event listeners for cards -----
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('a')) return;
                openModal(this);
            });
        });

        // ----- Modal controls -----
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            prevImage();
        });
        
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            nextImage();
        });
        
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModal();
        });
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) closeModal();
        });
        
        document.addEventListener('keydown', function(e) {
            if (!modalOverlay.classList.contains('active')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });

        console.log('✅ Modal ready!');
    }
})();