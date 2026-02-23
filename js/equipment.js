// ChemBuddy - Equipment Browser Module

var Equipment = (function () {
    'use strict';

    var currentEquipId = null;
    var studyTimers = {};

    // Equipment images: id -> array of {src, caption}
    var equipImages = {
        'centrifugal-pump': [
            { src: 'images/pumps/Centrifugal_Pump.svg.png', caption: '3D cutaway view' },
            { src: 'images/pumps/Centrifugal_5.png', caption: 'Color cross-section showing internal stages' },
            { src: 'images/pumps/IH-Type_Series_Chemical_Pump.jpg', caption: 'Chemical process pump' },
            { src: 'images/pumps/New_type__SS__centrifugal_pump_by_Allis_Chalmers_Manufacture_Company,_1914.jpg', caption: 'Centrifugal pump with exposed impeller' }
        ],
        'multistage-pump': [
            { src: 'images/pumps/SR_horizontal_multistage_pumps.jpg', caption: 'Horizontal multistage pump' },
            { src: 'images/pumps/Multistage_centrifugal_pump.jpg', caption: 'Multistage pump installed in plant' },
            { src: 'images/pumps/multistage-pump.png', caption: 'Cross-section diagram' }
        ],
        'vertical-pump': [
            { src: 'images/pumps/KSIL-_KCIL_vertical_multisatge_pumps.jpg', caption: 'Vertical multistage inline pump' },
            { src: 'images/pumps/RKB_V_vertical_multistage_pumps.jpg', caption: 'Vertical multistage pump' },
            { src: 'images/pumps/vertical-pump.png', caption: 'Cross-section diagram' }
        ],
        'axial-pump': [{ src: 'images/pumps/axial-pump.png', caption: 'Cross-section diagram' }],
        'turbine-pump': [{ src: 'images/pumps/turbine-pump.png', caption: 'Cross-section diagram' }],
        'regenerative-pump': [{ src: 'images/pumps/regenerative-pump.png', caption: 'Performance curves' }],
        'reciprocating-pump': [{ src: 'images/pumps/reciprocating-pump.png', caption: 'Cross-section diagram' }],
        'diaphragm-pump': [{ src: 'images/pumps/diaphragm-pump.png', caption: 'Cross-section diagram' }],
        'gear-pump': [{ src: 'images/pumps/gear-pump.png', caption: 'Cross-section diagram' }],
        'screw-pump': [{ src: 'images/pumps/screw-pump.png', caption: 'Cross-section diagram' }],
        'canned-pump': [{ src: 'images/pumps/canned-pump.png', caption: 'Cross-section diagram' }]
    };

    function getImageHTML(id) {
        var imgs = equipImages[id];
        if (!imgs || !imgs.length) return '';
        var name = Utils.sanitize((equipmentDB[id] || {}).name || id);

        if (imgs.length === 1) {
            return '<div class="equip-diagram">' +
                '<img src="' + imgs[0].src + '" alt="' + name + '">' +
                '<p class="equip-diagram-caption">' + Utils.sanitize(imgs[0].caption) + '</p>' +
                '</div>';
        }

        // Multiple images — gallery with thumbnails
        var html = '<div class="equip-gallery" data-equip-gallery="' + id + '">';
        html += '<div class="equip-gallery-main">';
        html += '<img src="' + imgs[0].src + '" alt="' + name + '" id="gallery-main-' + id + '">';
        html += '<p class="equip-diagram-caption" id="gallery-caption-' + id + '">' + Utils.sanitize(imgs[0].caption) + '</p>';
        html += '</div>';
        html += '<div class="equip-gallery-thumbs">';
        imgs.forEach(function (img, idx) {
            html += '<img src="' + img.src + '" alt="' + name + '" class="gallery-thumb' + (idx === 0 ? ' active' : '') + '" data-idx="' + idx + '" data-caption="' + Utils.sanitize(img.caption) + '">';
        });
        html += '</div></div>';
        return html;
    }

    function attachGalleryListeners(container) {
        container.querySelectorAll('.equip-gallery').forEach(function (gallery) {
            gallery.querySelectorAll('.gallery-thumb').forEach(function (thumb) {
                thumb.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var id = gallery.dataset.equipGallery;
                    var mainImg = document.getElementById('gallery-main-' + id);
                    var caption = document.getElementById('gallery-caption-' + id);
                    if (mainImg) mainImg.src = this.src;
                    if (caption) caption.textContent = this.dataset.caption;
                    gallery.querySelectorAll('.gallery-thumb').forEach(function (t) { t.classList.remove('active'); });
                    this.classList.add('active');
                });
            });
        });
    }

    function renderBrowse(container, params) {
        var html = '<div class="browse-layout">';

        // Sidebar
        html += '<div class="browse-sidebar">';
        html += '<div class="browse-sidebar-header">';
        html += '<input type="text" class="browse-search" id="browse-search" placeholder="Search 219 equipment...">';
        html += '</div>';
        html += '<ul class="browse-nav" id="browse-nav"></ul>';
        html += '</div>';

        // Detail panel
        html += '<div class="browse-detail" id="browse-detail">';
        html += '<div class="equip-welcome">';
        html += '<h2>Select Equipment</h2>';
        html += '<p>Choose from 219 equipment types across 19 categories</p>';
        html += '<div class="stat-grid mt-3">';

        var totalEquip = 0;
        categories.forEach(function (cat) { totalEquip += cat.items.length; });
        html += '<div class="stat-card"><div class="stat-value">' + totalEquip + '</div><div class="stat-label">Equipment Types</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + categories.length + '</div><div class="stat-label">Categories</div></div>';

        var studiedCount = Object.keys((window.ChemBuddy.progress || {}).studied || {}).length;
        html += '<div class="stat-card"><div class="stat-value">' + studiedCount + '</div><div class="stat-label">Studied</div></div>';

        html += '</div></div></div>';
        html += '</div>';

        container.innerHTML = html;
        buildNav();
        setupSearch();
    }

    function renderBrowseEquip(container, params) {
        renderBrowse(container, params);
        // Delay to ensure DOM is ready
        setTimeout(function () {
            showEquipment(params.equipId);
        }, 50);
    }

    function buildNav() {
        var nav = document.getElementById('browse-nav');
        if (!nav) return;

        var studied = (window.ChemBuddy.progress || {}).studied || {};

        var html = '';
        categories.forEach(function (cat) {
            html += '<li class="browse-cat" data-cat="' + cat.id + '">';
            html += '<div class="browse-cat-head">';
            html += '<span class="browse-cat-icon">' + cat.icon + '</span>';
            html += '<div class="browse-cat-text"><h3>' + cat.name + '</h3><p>' + cat.desc + '</p></div>';
            html += '<span class="browse-cat-badge">' + cat.items.length + '</span>';
            html += '<span class="browse-cat-arrow">▶</span>';
            html += '</div>';
            html += '<div class="browse-sub">';
            cat.items.forEach(function (item) {
                var isStudied = studied[item.id];
                html += '<button class="browse-sub-item" data-id="' + item.id + '">';
                html += Utils.sanitize(item.name);
                if (isStudied) html += '<span class="studied-check">✓</span>';
                html += '</button>';
            });
            html += '</div></li>';
        });

        nav.innerHTML = html;

        // Category expand/collapse
        nav.querySelectorAll('.browse-cat-head').forEach(function (head) {
            head.addEventListener('click', function () {
                this.parentElement.classList.toggle('open');
            });
        });

        // Equipment click
        nav.querySelectorAll('.browse-sub-item').forEach(function (item) {
            item.addEventListener('click', function () {
                nav.querySelectorAll('.browse-sub-item').forEach(function (i) { i.classList.remove('active'); });
                this.classList.add('active');
                showEquipment(this.dataset.id);
                window.location.hash = '/browse/' + this.dataset.id;
            });
        });
    }

    function setupSearch() {
        var searchInput = document.getElementById('browse-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', Utils.debounce(function () {
            var query = this.value.toLowerCase().trim();
            var nav = document.getElementById('browse-nav');

            if (!query) {
                nav.querySelectorAll('.browse-cat').forEach(function (el) { el.style.display = ''; });
                nav.querySelectorAll('.browse-sub-item').forEach(function (el) { el.style.display = ''; });
                return;
            }

            categories.forEach(function (cat) {
                var catEl = nav.querySelector('[data-cat="' + cat.id + '"]');
                if (!catEl) return;
                var hasMatch = false;

                cat.items.forEach(function (item) {
                    var itemEl = catEl.querySelector('[data-id="' + item.id + '"]');
                    if (!itemEl) return;
                    var equip = equipmentDB[item.id];
                    var searchText = (item.name + ' ' + (equip ? equip.description : '')).toLowerCase();
                    if (searchText.includes(query)) {
                        itemEl.style.display = '';
                        hasMatch = true;
                    } else {
                        itemEl.style.display = 'none';
                    }
                });

                catEl.style.display = hasMatch ? '' : 'none';
                if (hasMatch) catEl.classList.add('open');
            });
        }, 200));
    }

    function showEquipment(id) {
        var equip = equipmentDB[id];
        if (!equip) return;

        currentEquipId = id;
        var detail = document.getElementById('browse-detail');
        if (!detail) return;

        var studied = ((window.ChemBuddy.progress || {}).studied || {})[id];

        var html = '<div class="equip-detail">';

        // Breadcrumb
        html += '<div class="equip-breadcrumb">' + Utils.sanitize(equip.category) + ' › <span>' + Utils.sanitize(equip.name) + '</span></div>';

        // Header
        html += '<div class="equip-header">';
        html += '<h1>' + Utils.sanitize(equip.name) + '</h1>';
        if (studied) {
            html += '<span class="badge badge-success">✓ Studied</span>';
        }
        html += '</div>';

        // Diagram image (if available)
        html += getImageHTML(id);

        // Description
        html += '<div class="equip-section"><h3>Description</h3><p>' + Utils.sanitize(equip.description) + '</p></div>';

        // Principles
        if (equip.principles) {
            html += '<div class="equip-section"><h3>Operating Principles</h3><p>' + Utils.sanitize(equip.principles) + '</p></div>';
        }

        // Parts
        if (equip.parts) {
            html += '<div class="equip-section"><h3>Parts of the Equipment</h3><p>' + Utils.sanitize(equip.parts) + '</p></div>';
        }

        // Specs
        if (equip.specs && equip.specs.length) {
            html += '<div class="equip-section"><h3>Key Specifications</h3><div class="equip-specs">';
            equip.specs.forEach(function (s) {
                html += '<div class="spec-card"><div class="spec-title">' + Utils.sanitize(s.t) + '</div><div class="spec-value">' + Utils.sanitize(s.v) + '</div></div>';
            });
            html += '</div></div>';
        }

        // Components
        if (equip.components && equip.components.length) {
            html += '<div class="equip-section"><h3>Major Components</h3><ul class="equip-list">';
            equip.components.forEach(function (c) {
                html += '<li>' + Utils.sanitize(c) + '</li>';
            });
            html += '</ul></div>';
        }

        // Troubleshooting
        if (equip.troubles && equip.troubles.length) {
            html += '<div class="equip-section"><h3>Troubleshooting Guide</h3>';
            html += '<table class="equip-table"><thead><tr><th>Problem</th><th>Possible Causes</th><th>Corrective Action</th></tr></thead><tbody>';
            equip.troubles.forEach(function (t) {
                html += '<tr><td>' + Utils.sanitize(t.p) + '</td><td>' + Utils.sanitize(t.c) + '</td><td>' + Utils.sanitize(t.a) + '</td></tr>';
            });
            html += '</tbody></table></div>';
        }

        // Observations
        if (equip.observations && equip.observations.length) {
            html += '<div class="equip-section"><h3>Field Observations</h3><ul class="equip-list">';
            equip.observations.forEach(function (o) {
                html += '<li>' + Utils.sanitize(o) + '</li>';
            });
            html += '</ul></div>';
        }

        // Safety
        if (equip.safety && equip.safety.length) {
            html += '<div class="equip-safety"><h3>⚠️ Safety Considerations</h3><ul class="equip-list">';
            equip.safety.forEach(function (s) {
                html += '<li>' + Utils.sanitize(s) + '</li>';
            });
            html += '</ul></div>';
        }

        html += '</div>';
        detail.innerHTML = html;

        // Attach gallery thumbnail click listeners
        attachGalleryListeners(detail);

        // Highlight active nav item
        var nav = document.getElementById('browse-nav');
        if (nav) {
            nav.querySelectorAll('.browse-sub-item').forEach(function (item) {
                item.classList.toggle('active', item.dataset.id === id);
            });
            // Open parent category
            var activeItem = nav.querySelector('[data-id="' + id + '"]');
            if (activeItem) {
                var parent = activeItem.closest('.browse-cat');
                if (parent) parent.classList.add('open');
            }
        }
    }

    // Render equipment detail inline (for learn mode)
    function renderEquipmentDetail(id) {
        var equip = equipmentDB[id];
        if (!equip) return '<p>Equipment not found.</p>';

        var html = '';
        html += getImageHTML(id);
        html += '<p>' + Utils.sanitize(equip.description) + '</p>';

        if (equip.principles) {
            html += '<h4 class="mt-2 mb-1">Operating Principles</h4><p>' + Utils.sanitize(equip.principles) + '</p>';
        }

        if (equip.parts) {
            html += '<h4 class="mt-2 mb-1">Parts of the Equipment</h4><p>' + Utils.sanitize(equip.parts) + '</p>';
        }

        if (equip.specs && equip.specs.length) {
            html += '<h4 class="mt-2 mb-1">Key Specifications</h4><div class="equip-specs">';
            equip.specs.forEach(function (s) {
                html += '<div class="spec-card"><div class="spec-title">' + Utils.sanitize(s.t) + '</div><div class="spec-value">' + Utils.sanitize(s.v) + '</div></div>';
            });
            html += '</div>';
        }

        if (equip.components && equip.components.length) {
            html += '<h4 class="mt-2 mb-1">Major Components</h4><ul class="equip-list">';
            equip.components.forEach(function (c) { html += '<li>' + Utils.sanitize(c) + '</li>'; });
            html += '</ul>';
        }

        if (equip.troubles && equip.troubles.length) {
            html += '<h4 class="mt-2 mb-1">Troubleshooting</h4>';
            html += '<table class="equip-table"><thead><tr><th>Problem</th><th>Causes</th><th>Action</th></tr></thead><tbody>';
            equip.troubles.forEach(function (t) {
                html += '<tr><td>' + Utils.sanitize(t.p) + '</td><td>' + Utils.sanitize(t.c) + '</td><td>' + Utils.sanitize(t.a) + '</td></tr>';
            });
            html += '</tbody></table>';
        }

        if (equip.safety && equip.safety.length) {
            html += '<div class="equip-safety mt-2"><h4>⚠️ Safety</h4><ul class="equip-list">';
            equip.safety.forEach(function (s) { html += '<li>' + Utils.sanitize(s) + '</li>'; });
            html += '</ul></div>';
        }

        return html;
    }

    return {
        renderBrowse: renderBrowse,
        renderBrowseEquip: renderBrowseEquip,
        showEquipment: showEquipment,
        renderEquipmentDetail: renderEquipmentDetail,
        attachGalleryListeners: attachGalleryListeners
    };
})();
