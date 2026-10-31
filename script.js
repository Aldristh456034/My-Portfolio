// ================================================================
// CLOUDFLARE R2 CONFIG
// Deployed Worker reads the my-portfolio bucket through an R2 binding.
// /images/<key> serves images; /api/images?prefix=<folder> lists real keys.
// No Cloudflare credentials or local image folders are used in the browser.
// ================================================================
const R2_API_URL = 'https://portfolio-r2-media.trinidadaldrich328.workers.dev';
const R2_BASE_URL = R2_API_URL + '/images';
const projectImageCache = new Map();

function r2Url(path) {
    const key = String(path).replace(/^\/+/, '');
    return R2_BASE_URL + '/' + key.split('/').map(encodeURIComponent).join('/');
}

async function getR2ProjectImages(folder) {
    if (!folder) return [];
    if (!projectImageCache.has(folder)) {
        const request = fetch(R2_API_URL + '/api/images?prefix=' + encodeURIComponent(folder), {
            signal: AbortSignal.timeout(15000)
        }).then(async response => {
            if (!response.ok) throw new Error('R2 folder request failed: ' + response.status);
            const data = await response.json();
            if (!Array.isArray(data.images)) throw new Error('Invalid R2 image listing');
            return data.images.map(r2Url);
        }).catch(error => {
            projectImageCache.delete(folder);
            throw error;
        });
        projectImageCache.set(folder, request);
    }
    return projectImageCache.get(folder);
}

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
        
        // Keep the R2 folder on the card even if a preview fails to load.
        document.querySelectorAll('.project-card').forEach(card => {
            const key = card.querySelector('img[data-src]')?.dataset.src;
            if (key) card.dataset.folder = key.slice(0, key.lastIndexOf('/') + 1);
        });

        // Show all cards in skeleton mode initially
        enableSkeletonMode();
        
        // Start loading images for each card
        loadAllCardImages();
        
        // Setup modal
        setupModal();

        // Attach load/error handlers before starting network requests.
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = r2Url(img.dataset.src);
        });
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
            if (img.getAttribute('src') && img.complete && img.naturalHeight !== 0) {
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

            // Settle only once, including when a timed-out image loads later.
            let settled = false;
            const settle = () => {
                if (settled) return;
                settled = true;
                loadedCount++;
                checkAllLoaded(loadedCount, totalCards);
            };

            // Set up load event
            img.addEventListener('load', function() {
                card.classList.remove('skeleton-mode');
                if (previewDiv) {
                    previewDiv.classList.remove('skeleton');
                    previewDiv.classList.add('loaded');
                }
                card.classList.add('loaded');
                settle();
                console.log(`✅ Card ${index + 1} loaded: ${card.dataset.title || 'Project'}`);
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
                settle();
                console.warn(`⚠️ Card ${index + 1} failed: ${card.dataset.title || 'Project'}`);
            });

            // Fallback timeout - if image takes too long, show card anyway
            setTimeout(() => {
                if (card.classList.contains('skeleton-mode')) {
                    card.classList.remove('skeleton-mode');
                    if (previewDiv) {
                        previewDiv.classList.remove('skeleton');
                        previewDiv.classList.add('loaded');
                        // Keep the pending image so slower R2 downloads can finish.
                    }
                    card.classList.add('loaded');
                    settle();
                    console.log(`⏱️ Card ${index + 1} loaded (timeout): ${card.dataset.title || 'Project'}`);
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
                    // Do not remove pending images from the DOM.
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
        const gallery = document.getElementById('modalGallery');
        const zoomBtn = document.getElementById('galleryZoom');
        const expandBtn = document.getElementById('galleryExpand');
        const galleryPrev = document.getElementById('galleryPrev');
        const galleryNext = document.getElementById('galleryNext');

        let imageToken = 0;
        let currentCard = null;
        let currentImageIndex = 0;
        let currentImages = [];
        let totalImages = 0;
        let modalRequestId = 0;

        // ----- Open modal with card data -----
        async function openModal(card) {
            const requestId = ++modalRequestId;
            currentCard = card;
            currentImageIndex = 0;
            currentImages = [];
            totalImages = 0;
            prevBtn.disabled = true;
            nextBtn.disabled = true;

            const title = card.dataset.title || 'Project';
            const longDesc = card.dataset.longdesc || 'No description available.';
            const github = card.dataset.github || '#';

            const folder = card.dataset.folder || '';
            
            modalTitle.textContent = title;
            modalDesc.innerHTML = `<strong>Description:</strong>\n${longDesc}`;
            modalGitHub.href = github;

            modalContent.scrollTop = 0;
            
            modalPlaceholder.style.display = 'flex';
            modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>loading...</span>`;
            modalImg.style.display = 'none';
            
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            try {
                const existing = await getR2ProjectImages(folder);
                if (requestId !== modalRequestId) return;
                currentImages = existing;
                totalImages = currentImages.length;
                prevBtn.disabled = totalImages < 2;
                nextBtn.disabled = totalImages < 2;
                
                if (totalImages === 0) {
                    modalImg.style.display = 'none';
                    modalPlaceholder.style.display = 'flex';
                    modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>no preview</span>`;
                    return;
                }
                
                showImage(0);
            } catch (error) {
                if (requestId !== modalRequestId) return;
                console.error('Unable to load R2 project:', error);
                modalImg.style.display = 'none';
                modalPlaceholder.style.display = 'flex';
                modalPlaceholder.textContent = 'Unable to load R2 images. Close and reopen to retry.';
            }
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
                setZoom(false);
                const token = ++imageToken;
                const hasImage = modalImg.style.display !== 'none' && modalImg.getAttribute('src');
                if (!hasImage) {
                    modalPlaceholder.style.display = 'flex';
                    modalPlaceholder.textContent = 'Loading image...';
                }
                // Preload off-screen and swap only when ready, keeping the old
                // image visible so the frame never collapses/bounces.
                const loader = new Image();
                loader.onload = function() {
                    if (token !== imageToken) return;
                    modalImg.src = url;
                    modalImg.style.display = 'block';
                    modalPlaceholder.style.display = 'none';
                };
                loader.onerror = function() {
                    if (token !== imageToken) return;
                    modalImg.style.display = 'none';
                    modalPlaceholder.style.display = 'flex';
                    modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>image not found</span>`;
                };
                loader.src = url;
            } else {
                modalImg.style.display = 'none';
                modalPlaceholder.style.display = 'flex';
                modalPlaceholder.innerHTML = `<i class="material-icons-round" style="font-size:2.4rem;">image</i> <span>preview</span>`;
            }
        }

        // ----- Zoom / expand -----
        function setZoom(on) {
            gallery.classList.toggle('zoomed', on);
            if (!on) modalImg.style.transformOrigin = '';
            zoomBtn.setAttribute('aria-pressed', String(on));
            zoomBtn.querySelector('.material-icons-round').textContent = on ? 'zoom_out' : 'zoom_in';
            zoomBtn.title = on ? 'Unzoom' : 'Zoom';
        }

        function panZoom(e) {
            if (!gallery.classList.contains('zoomed')) return;
            const rect = gallery.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            modalImg.style.transformOrigin = x + '% ' + y + '%';
        }

        function syncExpandBtn() {
            const on = document.fullscreenElement === gallery;
            expandBtn.setAttribute('aria-pressed', String(on));
            expandBtn.querySelector('.material-icons-round').textContent = on ? 'close_fullscreen' : 'open_in_full';
            expandBtn.title = on ? 'Collapse' : 'Expand';
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
            modalRequestId++;
            imageToken++;
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            setZoom(false);
            modalImg.removeAttribute('src');
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
        
        zoomBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (modalImg.style.display === 'none') return;
            setZoom(!gallery.classList.contains('zoomed'));
        });

        if (gallery.requestFullscreen) {
            expandBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (document.fullscreenElement === gallery) {
                    document.exitFullscreen().catch(() => {});
                } else {
                    gallery.requestFullscreen().catch(() => {});
                }
            });
            document.addEventListener('fullscreenchange', syncExpandBtn);
        } else {
            expandBtn.style.display = 'none';
        }

        galleryPrev.addEventListener('click', function(e) { e.stopPropagation(); prevImage(); });
        galleryNext.addEventListener('click', function(e) { e.stopPropagation(); nextImage(); });
        gallery.addEventListener('mousemove', panZoom);
        modalImg.addEventListener('click', function(e) {
            e.stopPropagation();
            panZoom(e);
            setZoom(!gallery.classList.contains('zoomed'));
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