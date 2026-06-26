// ================================================================
// MODAL FUNCTIONALITY + PER-CARD SKELETON LOADING
// FIXED: Proper image ordering based on numbering
// ================================================================

(function() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        console.log('🚀 Portfolio loading with per-card skeletons...');
        
        // Show all cards in skeleton mode initially
        enableSkeletonMode();
        
        // Start loading images for each card
        loadAllCardImages();
        
        // Setup modal
        setupModal();
    }

    // ----- Enable skeleton mode on all cards -----
    function enableSkeletonMode() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.classList.add('skeleton-mode');
            const previewImg = card.querySelector('.preview-img');
            if (previewImg) {
                previewImg.classList.add('skeleton');
                previewImg.classList.remove('loaded');
            }
        });
        console.log('🔄 Skeleton mode enabled on all cards');
    }

    // ----- Load images for each card individually -----
    function loadAllCardImages() {
        const cards = document.querySelectorAll('.project-card');
        let loadedCount = 0;
        const totalCards = cards.length;

        if (totalCards === 0) {
            console.warn('No project cards found');
            return;
        }

        console.log(`📸 Loading ${totalCards} card images...`);

        cards.forEach((card, index) => {
            const img = card.querySelector('.preview-img img');
            const previewDiv = card.querySelector('.preview-img');

            if (!img) {
                // No image - show card immediately
                card.classList.remove('skeleton-mode');
                if (previewDiv) {
                    previewDiv.classList.remove('skeleton');
                    previewDiv.classList.add('loaded');
                }
                card.classList.add('loaded');
                loadedCount++;
                checkAllLoaded(loadedCount, totalCards);
                return;
            }

            // Check if image is already loaded
            if (img.complete && img.naturalHeight !== 0) {
                // Image already loaded
                card.classList.remove('skeleton-mode');
                if (previewDiv) {
                    previewDiv.classList.remove('skeleton');
                    previewDiv.classList.add('loaded');
                }
                card.classList.add('loaded');
                loadedCount++;
                console.log(`✅ Card ${index + 1} loaded (cached): ${card.dataset.title || 'Project'}`);
                checkAllLoaded(loadedCount, totalCards);
                return;
            }

            // Set up load event
            img.addEventListener('load', function() {
                card.classList.remove('skeleton-mode');
                if (previewDiv) {
                    previewDiv.classList.remove('skeleton');
                    previewDiv.classList.add('loaded');
                }
                card.classList.add('loaded');
                loadedCount++;
                console.log(`✅ Card ${index + 1} loaded: ${card.dataset.title || 'Project'}`);
                checkAllLoaded(loadedCount, totalCards);
            });

            // Set up error event
            img.addEventListener('error', function() {
                // Image failed - show card with placeholder
                card.classList.remove('skeleton-mode');
                if (previewDiv) {
                    previewDiv.classList.remove('skeleton');
                    previewDiv.classList.add('loaded');
                    // Show placeholder text
                    previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${card.dataset.title || 'Project'}</span>`;
                }
                card.classList.add('loaded');
                loadedCount++;
                console.warn(`⚠️ Card ${index + 1} failed: ${card.dataset.title || 'Project'}`);
                checkAllLoaded(loadedCount, totalCards);
            });

            // Fallback timeout - if image takes too long, show card anyway
            setTimeout(() => {
                if (card.classList.contains('skeleton-mode')) {
                    card.classList.remove('skeleton-mode');
                    if (previewDiv) {
                        previewDiv.classList.remove('skeleton');
                        previewDiv.classList.add('loaded');
                        // If image hasn't loaded, show placeholder
                        if (!img.src || img.src === '' || !img.complete) {
                            previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${card.dataset.title || 'Project'}</span>`;
                        }
                    }
                    card.classList.add('loaded');
                    loadedCount++;
                    console.log(`⏱️ Card ${index + 1} loaded (timeout): ${card.dataset.title || 'Project'}`);
                    checkAllLoaded(loadedCount, totalCards);
                }
            }, 6000);
        });

        // Safety timeout - force all cards visible
        setTimeout(() => {
            document.querySelectorAll('.project-card.skeleton-mode').forEach(card => {
                card.classList.remove('skeleton-mode');
                const previewDiv = card.querySelector('.preview-img');
                if (previewDiv) {
                    previewDiv.classList.remove('skeleton');
                    previewDiv.classList.add('loaded');
                    const img = previewDiv.querySelector('img');
                    if (!img || !img.complete || img.naturalHeight === 0) {
                        previewDiv.innerHTML = `<i class="material-icons-round" style="font-size:2.2rem; opacity:0.7;">image</i> <span>${card.dataset.title || 'Project'}</span>`;
                    }
                }
                card.classList.add('loaded');
            });
            console.log('✅ All cards forced visible (safety timeout)');
        }, 10000);
    }

    function checkAllLoaded(loaded, total) {
        if (loaded === total) {
            console.log('🎉 All cards loaded successfully!');
        }
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

        // ----- Get all images from a project folder - IN ORDER -----
        function getProjectImages(folder) {
            const images = [];
            // Check up to 20 images IN ORDER
            for (let i = 1; i <= 20; i++) {
                images.push({
                    index: i,
                    url: folder + 'preview' + i + '.png'
                });
            }
            return images;
        }

        // ----- Detect which images actually exist - PRESERVING ORDER -----
        function detectExistingImages(images, callback) {
            const existing = [];
            let checked = 0;
            const total = images.length;

            if (total === 0) {
                callback([]);
                return;
            }

            // Check each image in order
            images.forEach((imgData, index) => {
                const img = new Image();
                const timeout = setTimeout(() => {
                    img.src = '';
                    checked++;
                    if (checked === total) {
                        // Sort existing images by index to maintain order
                        existing.sort((a, b) => a.index - b.index);
                        callback(existing.map(item => item.url));
                    }
                }, 500);

                img.onload = function() {
                    clearTimeout(timeout);
                    existing.push({
                        index: imgData.index,
                        url: imgData.url
                    });
                    checked++;
                    if (checked === total) {
                        // Sort existing images by index to maintain order
                        existing.sort((a, b) => a.index - b.index);
                        callback(existing.map(item => item.url));
                    }
                };
                img.onerror = function() {
                    clearTimeout(timeout);
                    checked++;
                    if (checked === total) {
                        // Sort existing images by index to maintain order
                        existing.sort((a, b) => a.index - b.index);
                        callback(existing.map(item => item.url));
                    }
                };
                img.src = imgData.url;
            });

            // Fallback timeout
            setTimeout(() => {
                if (checked < total) {
                    existing.sort((a, b) => a.index - b.index);
                    callback(existing.length > 0 ? existing.map(item => item.url) : []);
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
            
            // Loop back to 0 if index goes beyond total - 1
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
                // Only open if card is loaded
                if (this.classList.contains('loaded')) {
                    openModal(this);
                } else {
                    console.log('⏳ Card still loading, please wait...');
                }
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