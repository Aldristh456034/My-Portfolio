// ================================================================
// MODAL FUNCTIONALITY - Reads data from HTML attributes
// No data array needed - all data is in the HTML!
// ================================================================

(function() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModal);
    } else {
        initModal();
    }

    function initModal() {
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
            // Try to load preview1.png, preview2.png, etc.
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

            // Fallback timeout
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

            // Get folder path from the first image src
            const imgElement = card.querySelector('.preview-img img');
            let folder = '';
            if (imgElement) {
                const src = imgElement.src;
                const lastSlash = src.lastIndexOf('/');
                folder = src.substring(0, lastSlash + 1);
            }

            // Get images from folder and detect which exist
            const allImages = getProjectImages(folder);
            
            modalTitle.textContent = title;
            modalDesc.innerHTML = `<strong>Description:</strong>\n${longDesc}`;
            modalGitHub.href = github;

            modalContent.scrollTop = 0;
            
            // Show loading state
            modalPlaceholder.style.display = 'flex';
            modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>loading...</span>`;
            modalImg.style.display = 'none';
            
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Detect existing images
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
            // Reset to prevent showing stale data
            currentImages = [];
            totalImages = 0;
            currentImageIndex = 0;
        }

        // ----- Event listeners for cards -----
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking on a link inside
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

        console.log('🚀 Portfolio modal loaded!');
    }
})();