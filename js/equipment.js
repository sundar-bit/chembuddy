// ChemBuddy - Equipment Browser Module

var Equipment = (function () {
    'use strict';

    var currentEquipId = null;
    var studyTimers = {};

    // Equipment images: id -> array of {src, caption}
    var equipImages = {
        // Centrifugal, multistage, vertical, and axial pumps use the sectioned
        // educational images (equipSectionImages), not this generic gallery.
        'turbine-pump': [{ src: 'images/equipment/pumps/turbine-pump/turbine-pump-diagram.png', caption: 'Cross-section diagram' }],
        'regenerative-pump': [{ src: 'images/equipment/pumps/regenerative-pump/regenerative-pump-diagram.png', caption: 'Performance curves' }],
        'reciprocating-pump': [{ src: 'images/equipment/pumps/reciprocating-pump/reciprocating-pump-diagram.png', caption: 'Cross-section diagram' }],
        'diaphragm-pump': [{ src: 'images/equipment/pumps/diaphragm-pump/diaphragm-pump-diagram.png', caption: 'Cross-section diagram' }],
        'gear-pump': [{ src: 'images/equipment/pumps/gear-pump/gear-pump-diagram.png', caption: 'Cross-section diagram' }],
        'screw-pump': [{ src: 'images/equipment/pumps/screw-pump/screw-pump-diagram.png', caption: 'Cross-section diagram' }],
        'canned-pump': [{ src: 'images/equipment/pumps/canned-pump/canned-pump-diagram.png', caption: 'Cross-section diagram' }]
    };

    // Sectioned educational images: id -> { overview, components, working }.
    // When an equipment has an entry here, these purpose-built diagrams are
    // rendered inline within the relevant detail sections instead of the
    // generic top gallery. Each slot: { src, alt }.
    var equipSectionImages = {
        'centrifugal-pump': {
            overview: {
                src: 'images/equipment/pumps/centrifugal-pump/centrifugal-pump-isometric.png',
                alt: 'Isometric view of centrifugal pump with electric motor'
            },
            components: {
                src: 'images/equipment/pumps/centrifugal-pump/centrifugal-pump-cutaway.png',
                alt: 'Cutaway view of centrifugal pump showing major components'
            },
            working: {
                src: 'images/equipment/pumps/centrifugal-pump/centrifugal-pump-flow-path.png',
                alt: 'Centrifugal pump working principle and fluid flow path'
            }
        },
        'multistage-pump': {
            overview: {
                src: 'images/equipment/pumps/multistage-pump/multistage-pump-isometric.png',
                alt: 'Isometric view of multistage centrifugal pump with electric motor'
            },
            components: {
                src: 'images/equipment/pumps/multistage-pump/multistage-pump-cutaway.png',
                alt: 'Cutaway view of multistage pump showing major components'
            },
            working: {
                src: 'images/equipment/pumps/multistage-pump/multistage-pump-flow-path.png',
                alt: 'Multistage pump working principle and stage-by-stage fluid flow path'
            }
        },
        'vertical-pump': {
            overview: {
                src: 'images/equipment/pumps/vertical-pump/vertical-pump-isometric.png',
                alt: 'Isometric view of vertical centrifugal pump with electric motor'
            },
            components: {
                src: 'images/equipment/pumps/vertical-pump/vertical-pump-cutaway.png',
                alt: 'Cutaway view of vertical pump showing major components'
            },
            working: {
                src: 'images/equipment/pumps/vertical-pump/vertical-pump-flow-path.png',
                alt: 'Vertical pump working principle and stage-by-stage fluid flow path'
            }
        },
        'axial-pump': {
            overview: {
                src: 'images/equipment/pumps/axial-pump/axial-pump-isometric.png',
                alt: 'Isometric view of axial flow pump with electric motor'
            },
            components: {
                src: 'images/equipment/pumps/axial-pump/axial-pump-cutaway.png',
                alt: 'Cutaway view of axial flow pump showing major components'
            },
            working: {
                src: 'images/equipment/pumps/axial-pump/axial-pump-flow-path.png',
                alt: 'Axial flow pump working principle and stage-by-stage fluid flow path'
            }
        }
    };

    function getSectionImage(id, slot) {
        var set = equipSectionImages[id];
        if (!set || !set[slot]) return '';
        var img = set[slot];
        return '<figure class="equip-edu-image">' +
            '<img src="' + img.src + '" alt="' + Utils.sanitize(img.alt) + '" loading="lazy">' +
            '</figure>';
    }

    // Build the Parts & Components list.
    // Where the text is already numbered (1., 2., 3. ...) to match the cutaway
    // legend, suppress the bullet marker — a dot AND a number is two numbering
    // systems competing. Unnumbered lists (safety, field observations) keep bullets.
    function componentsListHTML(components) {
        if (!components || !components.length) return '';

        var numbered = components.every(function (c) {
            return /^\s*\d+\s*[.)]/.test(String(c));
        });

        var html = '<ul class="equip-list' + (numbered ? ' equip-list-numbered' : '') + '">';
        components.forEach(function (c) {
            html += '<li>' + Utils.sanitize(c) + '</li>';
        });
        return html + '</ul>';
    }

    function getImageHTML(id) {
        // Equipment with sectioned educational images renders those inline
        // within each section, so skip the generic top gallery here.
        if (equipSectionImages[id]) return '';
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
        var sections = getBrowseSections();
        var totalEquip = Object.keys(equipmentDB).length;

        html += '<input type="text" class="browse-search" id="browse-search" placeholder="Search ' + totalEquip + ' equipment...">';
        html += '</div>';
        html += '<ul class="browse-nav" id="browse-nav"></ul>';
        html += '</div>';

        // Detail panel
        html += '<div class="browse-detail" id="browse-detail">';
        html += '<div class="equip-welcome">';
        html += '<h2>Select Equipment</h2>';
        html += '<p>Choose from ' + totalEquip + ' equipment types across ' + categories.length + ' categories</p>';
        html += '<div class="stat-grid mt-3">';

        var level1Count = learningPath.allEquipment().length;
        html += '<div class="stat-card"><div class="stat-value">' + level1Count + '</div><div class="stat-label">Level 1 Equipment</div></div>';
        html += '<div class="stat-card"><div class="stat-value">' + totalEquip + '</div><div class="stat-label">Equipment Types</div></div>';

        var studiedCount = Object.keys((window.ChemBuddy.progress || {}).studied || {}).length;
        html += '<div class="stat-card"><div class="stat-value">' + studiedCount + '</div><div class="stat-label">Studied</div></div>';

        html += '</div></div></div>';
        html += '</div>';

        container.innerHTML = html;
        buildNav(sections);
        setupSearch(sections);
    }

    // Browse menu groups, built from equipmentDB so the menu always matches
    // the content. Level 1 = the learning-path modules; Level 2 = every other
    // equipment, grouped by its category.
    // Returns [{ level, heading, groups: [{ id, name, icon, desc, items: [{id, name}] }] }]
    function getBrowseSections() {
        var catByName = {};
        var catById = {};
        categories.forEach(function (cat) {
            catByName[cat.name] = cat;
            catById[cat.id] = cat;
        });

        var level1Ids = {};
        var level1Groups = learningPath.modules.map(function (mod) {
            var cat = catById[mod.categoryId] || {};
            return {
                id: 'l1-' + mod.id,
                name: mod.title,
                icon: cat.icon || '',
                desc: 'Module ' + mod.id,
                items: mod.equipment.filter(function (eq) {
                    level1Ids[eq.id] = true;
                    return !!equipmentDB[eq.id];
                }).map(function (eq) {
                    return { id: eq.id, name: equipmentDB[eq.id].name };
                })
            };
        });

        var level2ByCat = {};
        Object.keys(equipmentDB).forEach(function (id) {
            if (level1Ids[id]) return;
            var catName = equipmentDB[id].category;
            (level2ByCat[catName] = level2ByCat[catName] || []).push({ id: id, name: equipmentDB[id].name });
        });

        var level2Groups = [];
        categories.forEach(function (cat) {
            if (!level2ByCat[cat.name]) return;
            level2Groups.push({ id: 'l2-' + cat.id, name: cat.name, icon: cat.icon, desc: cat.desc, items: level2ByCat[cat.name] });
            delete level2ByCat[cat.name];
        });
        // Any category in equipmentDB that categories.js does not describe yet
        Object.keys(level2ByCat).forEach(function (catName) {
            level2Groups.push({ id: 'l2-' + catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: catName, icon: '', desc: '', items: level2ByCat[catName] });
        });

        return [
            { level: 1, heading: learningPath.title, groups: level1Groups },
            { level: 2, heading: 'Level 2 — More Equipment', groups: level2Groups }
        ];
    }

    function renderBrowseEquip(container, params) {
        renderBrowse(container, params);
        // Delay to ensure DOM is ready
        setTimeout(function () {
            showEquipment(params.equipId);
        }, 50);
    }

    function buildNav(sections) {
        var nav = document.getElementById('browse-nav');
        if (!nav) return;

        var studied = (window.ChemBuddy.progress || {}).studied || {};

        var html = '';
        sections.forEach(function (section) {
            html += '<li class="browse-level" data-level="' + section.level + '">' + Utils.sanitize(section.heading) + '</li>';
            section.groups.forEach(function (cat) {
                html += '<li class="browse-cat" data-cat="' + cat.id + '" data-level="' + section.level + '">';
                html += '<div class="browse-cat-head">';
                html += '<span class="browse-cat-icon">' + cat.icon + '</span>';
                html += '<div class="browse-cat-text"><h3>' + Utils.sanitize(cat.name) + '</h3><p>' + Utils.sanitize(cat.desc) + '</p></div>';
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

    function setupSearch(sections) {
        var searchInput = document.getElementById('browse-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', Utils.debounce(function () {
            var query = this.value.toLowerCase().trim();
            var nav = document.getElementById('browse-nav');

            if (!query) {
                nav.querySelectorAll('.browse-level').forEach(function (el) { el.style.display = ''; });
                nav.querySelectorAll('.browse-cat').forEach(function (el) { el.style.display = ''; });
                nav.querySelectorAll('.browse-sub-item').forEach(function (el) { el.style.display = ''; });
                return;
            }

            sections.forEach(function (section) {
                var levelHasMatch = false;

                section.groups.forEach(function (cat) {
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
                    if (hasMatch) levelHasMatch = true;
                });

                var levelEl = nav.querySelector('.browse-level[data-level="' + section.level + '"]');
                if (levelEl) levelEl.style.display = levelHasMatch ? '' : 'none';
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

        // Description — isometric image first, then the text that walks its labels
        html += '<div class="equip-section"><h3>Description</h3>';
        html += getSectionImage(id, 'overview');
        html += '<p>' + Utils.sanitize(equip.description) + '</p></div>';

        // Parts & Components (merged) — cutaway image first, then the numbered legend
        if (equip.parts || (equip.components && equip.components.length)) {
            html += '<div class="equip-section"><h3>Parts &amp; Components</h3>';
            html += getSectionImage(id, 'components');
            if (equip.parts) {
                html += '<p>' + Utils.sanitize(equip.parts) + '</p>';
            }
            html += componentsListHTML(equip.components);
            html += '</div>';
        }

        // Operating Principles — flow-path image first, then the stage-by-stage text
        if (equip.principles) {
            html += '<div class="equip-section"><h3>Operating Principles</h3>';
            html += getSectionImage(id, 'working');
            html += '<p>' + Utils.sanitize(equip.principles) + '</p></div>';
        }

        // Key Specifications
        if (equip.specs && equip.specs.length) {
            html += '<div class="equip-section"><h3>Key Specifications</h3><div class="equip-specs">';
            equip.specs.forEach(function (s) {
                html += '<div class="spec-card"><div class="spec-title">' + Utils.sanitize(s.t) + '</div><div class="spec-value">' + Utils.sanitize(s.v) + '</div></div>';
            });
            html += '</div></div>';
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

        // Field Observations
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

        // Description — isometric image first, then the text that walks its labels
        html += getSectionImage(id, 'overview');
        html += '<p>' + Utils.sanitize(equip.description) + '</p>';

        // Parts & Components (merged) — cutaway image first, then the numbered legend
        if (equip.parts || (equip.components && equip.components.length)) {
            html += '<h4 class="mt-2 mb-1">Parts &amp; Components</h4>';
            html += getSectionImage(id, 'components');
            if (equip.parts) {
                html += '<p>' + Utils.sanitize(equip.parts) + '</p>';
            }
            html += componentsListHTML(equip.components);
        }

        // Operating Principles — flow-path image first, then the stage-by-stage text
        if (equip.principles) {
            html += '<h4 class="mt-2 mb-1">Operating Principles</h4>';
            html += getSectionImage(id, 'working');
            html += '<p>' + Utils.sanitize(equip.principles) + '</p>';
        }

        // Key Specifications
        if (equip.specs && equip.specs.length) {
            html += '<h4 class="mt-2 mb-1">Key Specifications</h4><div class="equip-specs">';
            equip.specs.forEach(function (s) {
                html += '<div class="spec-card"><div class="spec-title">' + Utils.sanitize(s.t) + '</div><div class="spec-value">' + Utils.sanitize(s.v) + '</div></div>';
            });
            html += '</div>';
        }

        // Troubleshooting
        if (equip.troubles && equip.troubles.length) {
            html += '<h4 class="mt-2 mb-1">Troubleshooting</h4>';
            html += '<table class="equip-table"><thead><tr><th>Problem</th><th>Causes</th><th>Action</th></tr></thead><tbody>';
            equip.troubles.forEach(function (t) {
                html += '<tr><td>' + Utils.sanitize(t.p) + '</td><td>' + Utils.sanitize(t.c) + '</td><td>' + Utils.sanitize(t.a) + '</td></tr>';
            });
            html += '</tbody></table>';
        }

        // Safety
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
