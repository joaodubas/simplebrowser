(function (wdw, doc, $) {
    /**
     * open a django admin popup and create a hidden field containing the pertinet information to the popup access
     * besides that, replaces the parent lookup function so it can retrieve the parametes passed to the original
     * function
     */
    var oldDismiss = wdw.dismissRelatedLookupPopup,  //reference to the actual function that records the value selected on the popup
        oldDismissAdd = wdw.dismissAddAnotherPopup,  //reference to the actual function that records the value added on the popup
        modules = [
            { node: 'iframe', uri: '/api/video/' },
            { node: 'img', uri: '/api/imagem/' }
        ],
        fields = {}, eds = {}, cache_el = {},
        field, ed, current, ed_doc;

    var addNode = (function () {
        function ajaxAddCall(data) {
            /**
             * Add the snippet contained within the data
             * @param data {JSON} a JSON representation of the resource gathered
             */
            ed.execCommand('mceInsertContent', false, data.snippet);
            addCache(data.tag_id);
            ed.undoManager.add();
        }

        function ajaxEditCall(data) {
            /**
             * Replace the selected node with the snippet contained within the data
             * @param data {JSON} a JSON representation of the resource gathered
             */
            ed.execCommand('mceReplaceContent', false, data.snippet);
            addCache(data.tag_id);
            controlDeletion();
            ed.undoManager.add();
        }

        function ajaxCall(el) {
            /**
             * Assess the node and determine if a edit or add action should be returned
             * @param el {Node} the selected node
             */
            if (el && el.id && /^video|photo/.test(el.id))
                return ajaxEditCall;
            return ajaxAddCall;
        }

        function addNode(el_id, chosen_id) {
            /**
             * Add a new element node to the current text
             * @param el_id {String} the id of the form element that received the content
             * @param chosen_id {String, Number} the chosen element from the popup
             */
            var el = ed.selection.getNode(),
                node = /images$/.test(el_id) ? 1 : 0,
                module = modules[node];
            
            $.get(module.uri + chosen_id + '/', ajaxCall(el));
        }

        return addNode;
    })();

    function dismissRelatedLookupPopup(wdw, chosen_id) {
        /**
         * Populate the variable passed as the new window with the chosen id
         * and adds a new node to the current text
         * @param wdw {Window} the opened window
         * @param chosen_id {String, Number} the chosen element from the popup
         */
        oldDismiss(wdw, chosen_id);
        addNode(wdw.name, chosen_id);
    }

    function dismissAddAnotherPopup(wdw, chosen_id, chosen_repr) {
        /**
         * Populate the variable passed as the new window with chosen id
         * and adds a new node to the current text
         * @param wdw {Window} the opened window
         * @param chosen_id {String, Number} the id of the added object
         * @param chosen_repr {String} the representation of the object
         */
        oldDismissAdd(wdw, chosen_id, chosen_repr);
        addNode(wdw.name, chosen_id);
    }

    function setCurrentEd(key) {
        /**
         * Set the key (lookup id) and tinymce instance (ed) and field node reference
         * @param key {String} a lookup key
         */
        current = key;
        ed = eds[current];
        field = /video/.test(key) ? fields.video : fields.image;
    }

    function addEdsObject(ed, key) {
        /**
         * Add an editor instance to the key passed
         * @param ed {tinymce} an instance of tinymce
         * @param key {String} the key to associate the editor instance
         */
        if (!eds[key]) eds[key] = ed;
        setCurrentEd(key);
    }

    function showRelatedObjectLookup(ed, options) {
        /**
         * Prepare the page for a related object lookup and open a popup for the lookup
         */
        addEdsObject(ed, options.id);
        wdw.showRelatedObjectLookupPopup(options);
    }

    function hideTextMedia(e) {
        /**
         * hide the text video and image container
         */
        $('.text_videos, .text_images').css('display', 'none');
        fields.video = doc.getElementById('id_text_videos');
        fields.image = doc.getElementById('id_text_images');
    }

    function updateFieldValue(value) {
        /**
         * Update the value property of a node, removing the value passed
         * @param value {String} value to be removed from the el
         */
        var value_list = field.value.split(',');

        value_list.splice($.inArray(value, value_list), 1);
        field.value = value_list.join(',');
    }

    function unloadNodeCache(key) {
        /**
         * Perform the unload/deletion of the key
         */
        field = cache_el[key].field;
        updateFieldValue(cache_el[key].value);
        delete cache_el[key];
    }

    function controlDeletion() {
        /**
         * Control the deletion of the videos and photos registered for the document
         */
        for (key in cache_el)
            if (!ed_doc.getElementById(key)) unloadNodeCache(key);
    }

    function getIframeDocument() {
        /**
         * Get a reference to the iframe document
         */
        ed_doc = (function () {
            var iframe = doc.getElementsByTagName('iframe')[0],
                odoc;
            
            if (iframe) {
                odoc = iframe.contentWindow || iframe.contentDocument
                if (odoc.document) odoc = odoc.document;
            }

            return odoc;
        })();
    }

    function addCache(id, node) {
        node = node || ed_doc.getElementById(id);
        cache_el[id] = {value: id.match(/\d+$/)[0], node: node, field: /^video/.test(id) ? fields.video : fields.image};
    }

    function populateNodes() {
        /**
         * Cache the nodes related to images or videos 
         */
        var nodes = Array.prototype.slice.call(ed_doc.getElementsByTagName('img'), null),
            i, node;
        for (i = 0; node = nodes[i]; i += 1) {
            if (node.id && /^video|photo/.test(node.id)) addCache(node.id, node);
        }
        wdw.cache_el = cache_el;
    }

    function init(e) {
        hideTextMedia(e);
        getIframeDocument();
        populateNodes();
    }

    wdw.showRelatedObjectLookup = showRelatedObjectLookup;
    wdw.controlDeletion = controlDeletion;
    wdw.dismissRelatedLookupPopup = dismissRelatedLookupPopup;
    wdw.dismissAddAnotherPopup = dismissAddAnotherPopup;
    wdw.onload = init;
})(this, document, django.jQuery);

tinyMCE.init({
    // General options
    mode : "textareas",
    theme : "advanced",
    plugins: 'paste,media',

    // Layout
    width:              667,
    height:             250,
    object_resizing:    true,
    language : "pt",

    // Accessibility
    cleanup:                true,
    cleanup_on_startup:     true,
    accessibility_warnings: false,
    remove_trailing_nbsp:   true,
    fix_list_elements :     true,
    remove_script_host:     true,
    entity_encoding :       "raw",
    verify_html:            false,

    // Theme options
    theme_advanced_toolbar_location: "top",
    theme_advanced_toolbar_align: "left",
    theme_advanced_statusbar_location: "bottom",
    theme_advanced_buttons1: "formatselect,bold,italic,underline,|,justifyleft,justifycenter,justifyright,justifyfull,|,link,unlink,|,my_image,my_video,|,undo,redo,|,bullist,numlist,|,blockquote,pasteword",
    theme_advanced_buttons2: "",
    theme_advanced_buttons3: "",
    theme_advanced_path: false,
    theme_advanced_blockformats: "p,h4,h5,h6,pre",
    theme_advanced_styles: "[all] clearfix=clearfix;[p] small=small;[img] Image left-aligned=img_left;[img] Image left-aligned (nospace)=img_left_nospacetop;[img] Image right-aligned=img_right;[img] Image right-aligned (nospace)=img_right_nospacetop;[img] Image Block=img_block;[img] Image Block (nospace)=img_block_nospacetop;[div] column span-2=column span-2;[div] column span-4=column span-4;[div] column span-8=column span-8",
    theme_advanced_resizing : true,
    theme_advanced_resize_horizontal : false,
    theme_advanced_resizing_use_cookie : true,
    theme_advanced_styles: "Image left-aligned=img_left;Image left-aligned (nospace)=img_left_nospacetop;Image right-aligned=img_right;Image right-aligned (nospace)=img_right_nospacetop;Image Block=img_block",

    // elements
    valid_elements : [
        '-p,','a[href|target=_blank|class]','-strong/-b','-em/-i','-u','-ol',
        '-ul','-li','br','img[class|src|alt=|width|height]','-h4,-h5,-h6','-pre','-blockquote','-code','-div',
        '-iframe[src|width|height]'
    ].join(','),
    extended_valid_elements: [
        'a[name|class|href|target|title|onclick]',
        'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name|style|data-db-pk|id]',
        'br[clearfix]',
        '-p[class<clearfix?summary?code]',
        'h4[class<clearfix],h5[class<clearfix],h6[class<clearfix]',
        'ul[class<clearfix],ol[class<clearfix]',
        'div[class]',
        'address',
        'iframe[id|class|src|width|height|frameborder=0|allowfullscreen=allowfullscreen|data-db-pk]'
    ].join(','),
    valid_child_elements : [
        'h1/h2/h3/h4/h5/h6/a[%itrans_na]',       'table[thead|tbody|tfoot|tr|td]',
        'strong/b/p/div/em/i/td[%itrans|#text]', 'body[%btrans|#text]'
    ].join(','),

    // custom buttons
    setup: function (ed) {
        ed.addButton('my_image', {
            title: 'Imagens',
            image: '/static/image/icons/image.png',
            onclick: function () {
                showRelatedObjectLookup(ed, {
                    id: 'lookup_id_text_images',
                    href: '/admin/multimedia/photo/'
                });
            }
        });
        ed.addButton('my_video', {
            title: 'Vídeos',
            image: '/static/image/icons/video.png',
            onclick: function () {
                showRelatedObjectLookup(ed, {
                    id: 'lookup_id_text_videos',
                    href: '/admin/multimedia/video/'
                });
            }
        });
        ed.onNodeChange.add(function (ed, cm, node) {
            cm.setActive('my_video', /^video/.test(node.id));
            cm.setActive('my_image', /^photo/.test(node.id));
        });
        ed.onKeyUp.add(function (ed, key) {
            if (key.keyCode === 8 || key.keyCode === 46)
                controlDeletion();
        });
    }
});
