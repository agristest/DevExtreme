import $ from 'jquery';
import devices from 'core/devices';
import fx from 'animation/fx';
import { value as viewPort } from 'core/utils/view_port';
import pointerMock from '../../helpers/pointerMock.js';
import config from 'core/config';
import { isRenderer } from 'core/utils/type';
import browser from 'core/utils/browser';
import { compare as compareVersions } from 'core/utils/version';
import resizeCallbacks from 'core/utils/resize_callbacks';
import windowUtils from 'core/utils/window';
import themes from 'ui/themes';
import executeAsyncMock from '../../helpers/executeAsyncMock.js';
import visibilityChangeUtils from 'events/visibility_change';

import 'generic_light.css!';
import 'ui/popup';
import 'ui/tab_panel';

const IS_SAFARI = !!browser.safari;
const IS_OLD_SAFARI = IS_SAFARI && compareVersions(browser.version, [11]) < 0;
const PREVENT_SAFARI_SCROLLING_CLASS = 'dx-prevent-safari-scrolling';

themes.setDefaultTimeout(0);

QUnit.testStart(function() {
    const markup =
        '<style>\
            html, body {\
                height: 100%;\
                margin: 0;\
            }\
            \
            #qunit-fixture {\
                width: 100%;\
                height: 100%;\
            }\
        </style>\
        \
        <div id="popup"></div>\
        <div id="container"></div>\
        \
        <div id="popupWithAnonymousTmpl">\
            <div class="testContent">TestContent</div>\
        </div>\
        \
        <div id="popupWithContentTmpl">\
            <div data-options="dxTemplate: { name: \'content\'}">\
                <div class="testContent">testContent</div>\
            </div>\
        </div>\
        \
        <div id="popupWithTitleAndContentTmpl">\
            <div data-options="dxTemplate: { name: \'title\'}">\
                <div class="testTitle">testTitle</div>\
            </div>\
            <div data-options="dxTemplate: { name: \'content\'}">\
                <div class="testContent">testContent</div>\
            </div>\
        </div>\
        \
        <div id="popupWithTitleTemplate">\
            <div data-options="dxTemplate: { name: \'customTitle\' }">testTitle</div>\
            <div data-options="dxTemplate: { name: \'content\' }"></div>\
        </div>\
        \
        <div id="popupWithCustomAndContentTemplate">\
            <div data-options="dxTemplate: { name: \'custom\' }">\
                TestContent\
            </div>\
            <div data-options="dxTemplate: { name: \'content\' }">\
                WrongContent\
            </div>\
        </div>';

    $('#qunit-fixture').html(markup);
});

viewPort($('#qunit-fixture').addClass('dx-viewport'));

executeAsyncMock.setup();

const POPUP_CLASS = 'dx-popup';
const POPUP_WRAPPER_CLASS = 'dx-popup-wrapper';
const POPUP_CONTENT_CLASS = 'dx-popup-content';
const OVERLAY_CONTENT_CLASS = 'dx-overlay-content';
const OVERLAY_WRAPPER_CLASS = 'dx-overlay-wrapper';
const POPUP_BOTTOM_CLASS = 'dx-popup-bottom';
const POPUP_FULL_SCREEN_CLASS = 'dx-popup-fullscreen';
const POPUP_TITLE_CLASS = 'dx-popup-title';
const POPUP_TITLE_CLOSEBUTTON_CLASS = 'dx-closebutton';
const POPUP_HAS_CLOSE_BUTTON_CLASS = 'dx-has-close-button';
const POPUP_NORMAL_CLASS = 'dx-popup-normal';
const POPUP_CONTENT_FLEX_HEIGHT_CLASS = 'dx-popup-flex-height';
const POPUP_CONTENT_INHERIT_HEIGHT_CLASS = 'dx-popup-inherit-height';

const POPUP_DRAGGABLE_CLASS = 'dx-popup-draggable';

const viewport = function() { return $('.dx-viewport'); };


QUnit.module('basic', () => {
    QUnit.test('markup init', function(assert) {
        const $element = $('#popup').dxPopup();
        assert.ok($element.hasClass(POPUP_CLASS));

        $element.dxPopup('show');

        const $container = viewport().find(`.${POPUP_WRAPPER_CLASS}`).children();
        assert.ok($container.hasClass(OVERLAY_CONTENT_CLASS));
        assert.ok($container.children(':eq(0)').hasClass(POPUP_TITLE_CLASS));
        assert.ok($container.children(':eq(1)').hasClass(POPUP_CONTENT_CLASS));
    });

    QUnit.test('content', function(assert) {
        const instance = $('#popup').dxPopup({
            visible: true
        }).dxPopup('instance');

        assert.equal(instance.$content().get(0), viewport().find(`.${POPUP_WRAPPER_CLASS}`).find(`.${POPUP_CONTENT_CLASS}`).get(0));
    });

    QUnit.test('popup wrapper should have \'fixed\' or \'absolute\' position in fullscreen', function(assert) {
        $('#popup').dxPopup({ fullScreen: true, visible: true });

        const $wrapper = $('.' + POPUP_WRAPPER_CLASS);

        assert.ok(($wrapper.css('position') === 'fixed') || ($wrapper.css('position') === 'absolute'), 'popup wrapper position type is correct');
    });

    QUnit.test('shading has width and height if enabled', function(assert) {
        $('#popup').dxPopup({ visible: true });

        const $wrapper = $('.' + POPUP_WRAPPER_CLASS);

        assert.equal($wrapper.outerHeight(), $(document.body).outerHeight(), 'height is 100%');
        assert.equal($wrapper.outerWidth(), $(document.body).outerWidth(), 'width is 100%');
    });

    QUnit.test('default options', function(assert) {
        const $popup = $('#popup').dxPopup({ title: 'Any header', visible: true });
        const instance = $popup.dxPopup('instance');
        const $overlayContent = instance.$content().parent();

        assert.equal(instance.option('title'), 'Any header');
        assert.equal(instance.option('title'), $overlayContent.children().eq(0).text());

        instance.option('title', 'Other header');
        assert.equal($overlayContent.children().eq(0).text(), 'Other header');
    });

    QUnit.test('content template', function(assert) {
        const $popup = $('#popupWithContentTmpl').dxPopup({ visible: true });
        const instance = $popup.dxPopup('instance');
        const $content = instance.$content();

        instance.show();

        assert.equal($content.children().length, 1);
        assert.ok($content.find('.testContent').length);
        assert.equal($.trim($content.text()), 'testContent');
    });

    QUnit.test('title and content template', function(assert) {
        const $popup = $('#popupWithTitleAndContentTmpl').dxPopup({ visible: true });
        const instance = $popup.dxPopup('instance');
        const $title = $(`.${POPUP_TITLE_CLASS}`, viewport());
        const $content = instance.$content();

        assert.equal($title.children().length, 1);
        assert.ok($title.find('.testTitle').length);
        assert.equal($.trim($title.text()), 'testTitle');

        assert.equal($content.children().length, 1);
        assert.ok($content.find('.testContent').length);
        assert.equal($.trim($content.text()), 'testContent');
    });

    QUnit.test('custom titleTemplate option', function(assert) {
        $('#popupWithTitleTemplate').dxPopup({ titleTemplate: 'customTitle', visible: true });

        const $title = $(`.${POPUP_TITLE_CLASS}`, viewport());
        assert.equal($.trim($title.text()), 'testTitle', 'title text is correct');
    });

    QUnit.test('done button is located after cancel button in non-win8 device', function(assert) {
        devices.current('androidPhone');

        const $popup = $('#popup').dxPopup({
            toolbarItems: [{ shortcut: 'done' }, { shortcut: 'cancel' }],
            animation: null,
            visible: true
        });
        const instance = $popup.dxPopup('instance');

        let $popupBottom = instance.$content().parent().find('.dx-popup-bottom');

        assert.equal($popupBottom.text(), 'CancelOK', 'buttons order is correct');

        instance.option('toolbarItems', [{ shortcut: 'cancel' }, { shortcut: 'done' }]);
        $popupBottom = instance.$content().parent().find('.dx-popup-bottom');
        assert.equal($popupBottom.text(), 'CancelOK', 'buttons order is correct');
        devices.current(devices.real());
    });

    QUnit.test('buttons should be rendered correctly after toolbar was repainted', function(assert) {
        devices.current('desktop');
        const $popup = $('#popup').dxPopup({
            visible: true,
            toolbarItems: [
                { 'widget': 'dxButton', 'toolbar': 'bottom', 'location': 'before', 'options': { 'text': 'Today', 'type': 'today' } },
                { 'shortcut': 'done', 'options': { 'text': 'OK' }, 'toolbar': 'bottom', 'location': 'after' },
                { 'shortcut': 'cancel', 'options': { 'text': 'Cancel' }, 'toolbar': 'bottom', 'location': 'after' }]

        });
        const instance = $popup.dxPopup('instance');
        const $popupBottom = instance.$content().parent().find('.dx-popup-bottom');

        $popupBottom.dxToolbarBase('repaint');
        assert.equal($popupBottom.text(), 'TodayOKCancel', 'buttons order is correct');
        devices.current(devices.real());
    });

    QUnit.test('Check that title do not render twice or more, Q553652', function(assert) {
        const $popup = $('#popup').dxPopup({ visible: true, title: 'test' });
        const instance = $popup.dxPopup('instance');

        assert.equal(instance.option('title'), 'test', 'title is test');
        assert.equal($(`.${POPUP_TITLE_CLASS}`, viewport()).length, 1, 'there can be only one title');

        instance.option('visible', false);
        instance.option('title', 'test2');
        instance.option('visible', true);

        assert.equal(instance.option('title'), 'test2', 'title is test2');
        assert.equal($(`.${POPUP_TITLE_CLASS}`, viewport()).length, 1, 'there can be only one title');
    });

    QUnit.test('close button is not shown when title is not displayed', function(assert) {
        const $popup = $('#popup').dxPopup({ visible: true, closeButton: true, showTitle: false });
        const $closeButton = $('.' + POPUP_TITLE_CLOSEBUTTON_CLASS, $popup);

        assert.equal($closeButton.length, 0, 'close button element');
    });

    QUnit.test('close button is shown when title changes', function(assert) {
        const popup = $('#popup').dxPopup({
            visible: true,
            showTitle: true,
            showCloseButton: true
        }).dxPopup('instance');

        popup.option('title', 'new title');

        const $titleToolbar = popup.$wrapper().find(`.${POPUP_TITLE_CLASS}`);
        assert.ok($(`.${POPUP_TITLE_CLOSEBUTTON_CLASS}`, $titleToolbar).length);
    });

    QUnit.test('popup top toolbar rendering', function(assert) {
        $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{ text: 'top text', toolbar: 'top', location: 'center' }]
        });

        const $popupWrapper = $('.' + POPUP_WRAPPER_CLASS);
        const $titleToolbar = $popupWrapper.find('.' + POPUP_TITLE_CLASS);

        assert.ok($titleToolbar.hasClass('dx-toolbar'), 'top toolbar is present');
        assert.equal($titleToolbar.text(), 'top text', 'top toolbar has correct content');
    });

    QUnit.test('popup bottom toolbar rendering', function(assert) {
        $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{ text: 'bottom text', toolbar: 'bottom', location: 'center' }]
        });

        const $popupWrapper = $('.' + POPUP_WRAPPER_CLASS);
        const $bottomToolbar = $popupWrapper.find('.' + POPUP_BOTTOM_CLASS);

        assert.ok($bottomToolbar.hasClass('dx-toolbar'), 'bottom toolbar is present');
        assert.equal($bottomToolbar.text(), 'bottom text', 'bottom toolbar has correct content');
    });

    QUnit.test(`top toolbar has specific ${POPUP_HAS_CLOSE_BUTTON_CLASS} class`, function(assert) {
        const $popup = $('#popup').dxPopup({ visible: true, showCloseButton: true, showTitle: true });
        const $titleToolbar = $('.' + POPUP_TITLE_CLASS, $popup);

        assert.ok($titleToolbar.hasClass(POPUP_HAS_CLOSE_BUTTON_CLASS));
    });

    QUnit.test(`top toolbar has no specific ${POPUP_HAS_CLOSE_BUTTON_CLASS} class if popup has no close button`, function(assert) {
        const $popup = $('#popup').dxPopup({ visible: true, showCloseButton: true, showTitle: false });
        const $titleToolbar = $('.' + POPUP_TITLE_CLASS, $popup);

        assert.notOk($titleToolbar.hasClass(POPUP_HAS_CLOSE_BUTTON_CLASS));
    });

    QUnit.test('buttons rendering when aliases are specified', function(assert) {
        $('#popup').dxPopup({
            visible: true,
            showCloseButton: false,
            toolbarItems: [{ shortcut: 'cancel' }, { shortcut: 'done' }, { shortcut: 'clear' }]
        });

        const $popupWrapper = $('.' + POPUP_WRAPPER_CLASS);

        assert.equal($popupWrapper.find('.dx-button').length, 3, 'all buttons are rendered');
    });

    QUnit.test('shortcut buttons are placed in specified location', function(assert) {
        devices.current('desktop');
        $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{ shortcut: 'done', location: 'after' }]
        });

        const $button = $('.' + POPUP_BOTTOM_CLASS).find('.dx-toolbar-after').find('.dx-popup-done');

        assert.equal($button.length, 1, 'done button is at correct location');
        devices.current(devices.real());
    });

    QUnit.test('items should be rendered with toolbarItems.toolbar=\'top\' as default', function(assert) {
        $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{ text: 'sample', location: 'center' }]
        });

        const $popupWrapper = $('.' + POPUP_WRAPPER_CLASS);
        const $titleToolbar = $popupWrapper.find('.' + POPUP_TITLE_CLASS);

        const instance = $('#popup').dxPopup('instance');

        assert.equal(instance.option('toolbarItems')[0].toolbar, 'top', 'toolbar property was set correctly');
        assert.equal($titleToolbar.text(), 'sample', 'top toolbar has correct content');
    });

    QUnit.test('toolbar must receive \'rtlEnabled\' option from dxPopup', function(assert) {
        const $popup = $('#popup').dxPopup({
            visible: true,
            rtlEnabled: true,
            toolbarItems: [
                { 'widget': 'dxButton', 'toolbar': 'bottom', 'location': 'before', 'options': { 'text': 'Today', 'type': 'today' } },
                { 'shortcut': 'done', 'options': { 'text': 'OK' }, 'toolbar': 'bottom', 'location': 'after' },
                { 'shortcut': 'cancel', 'options': { 'text': 'Cancel' }, 'toolbar': 'bottom', 'location': 'after' }]

        });
        const instance = $popup.dxPopup('instance');
        const toolbarInstance = instance.$content().parent().find('.dx-popup-bottom').dxToolbarBase('instance');

        assert.ok(toolbarInstance.option('rtlEnabled'), 'toolbar\'s \'rtlEnabled\' option is true');
    });

    QUnit.test('toolbar must receive \'rtlEnabled\' from dxPopup after optionChanged', function(assert) {
        const $popup = $('#popup').dxPopup({
            visible: true,
            rtlEnabled: true,
            deferRendering: false,
            toolbarItems: [
                { 'widget': 'dxButton', 'toolbar': 'bottom', 'location': 'before', 'options': { 'text': 'Today', 'type': 'today' } },
                { 'shortcut': 'done', 'options': { 'text': 'OK' }, 'toolbar': 'bottom', 'location': 'after' },
                { 'shortcut': 'cancel', 'options': { 'text': 'Cancel' }, 'toolbar': 'bottom', 'location': 'after' }]

        });
        const instance = $popup.dxPopup('instance');

        instance.option('rtlEnabled', false);
        const toolbarInstance = instance.$content().parent().find('.dx-popup-bottom').dxToolbarBase('instance');

        assert.notOk(toolbarInstance.option('rtlEnabled'), 'toolbar\'s \'rtlEnabled\' option is false');
    });

    QUnit.test('toolbar must render \'default\' type buttons if \'useDefaultToolbarButtons\' is set', function(assert) {
        const popupInstance = $('#popup').dxPopup({
            visible: true,
            useDefaultToolbarButtons: true,
            deferRendering: false,
            toolbarItems: [{
                toolbar: 'bottom',
                widget: 'dxButton',
                options: { text: 'Retry', type: 'danger' }
            }, {
                toolbar: 'bottom',
                widget: 'dxButton',
                options: { text: 'Ok' }
            }]
        }).dxPopup('instance');

        const toolbarButtons = popupInstance.$content().parent().find('.dx-popup-bottom .dx-button');

        assert.ok(toolbarButtons.eq(0).hasClass('dx-button-danger'), 'button has custom class');
        assert.ok(toolbarButtons.eq(1).hasClass('dx-button-default'), 'button default class is \'default\', not normal');
    });

    QUnit.test('toolbar must render flat buttons and shortcuts if \'useFlatToolbarButtons\' is set', function(assert) {
        devices.current('desktop');
        const popupInstance = $('#popup').dxPopup({
            visible: true,
            useFlatToolbarButtons: true,
            deferRendering: false,
            toolbarItems: [{
                shortcut: 'done',
                options: { text: 'Retry' }
            }, {
                toolbar: 'bottom',
                widget: 'dxButton',
                options: { text: 'Ok' }
            }]
        }).dxPopup('instance');

        const toolbarButtons = popupInstance.$content().parent().find('.dx-popup-bottom .dx-button');

        assert.ok(toolbarButtons.eq(0).hasClass('dx-button-mode-text'), 'shortcut has dx-button-mode-text class');
        assert.ok(toolbarButtons.eq(1).hasClass('dx-button-mode-text'), 'button has dx-button-mode-text class');
        devices.current(devices.real());
    });
});

QUnit.module('dimensions', {
    beforeEach: function() {
        fx.off = true;
    },
    afterEach: function() {
        fx.off = false;
    }
}, () => {
    QUnit.test('content must not overlap bottom buttons', function(assert) {
        devices.current('desktop');
        const $popup = $('#popup').dxPopup({
            toolbarItems: [{ shortcut: 'cancel' }, { shortcut: 'done' }, { shortcut: 'clear' }],
            showCloseButton: true,
            visible: true
        });
        const instance = $popup.dxPopup('instance');
        const $popupContent = instance.$content();
        const $popupBottom = $popupContent.parent().find('.dx-popup-bottom');

        assert.roughEqual($popupContent.offset().top + $popupContent.outerHeight(), $popupBottom.offset().top, 0.1, 'content doesn\'t overlap bottom buttons');
        devices.current(devices.real());
    });

    QUnit.test('dimensions should be shrunk correctly with height = auto specified', function(assert) {
        const $content = $('#popup').dxPopup({
            visible: true,
            width: 'auto',
            height: 'auto',
            contentTemplate: function() {
                return $('<div>').width(200).height(200);
            }
        }).dxPopup('instance').$content();

        const popupContentHeight = $content.height();
        const addedContent = $('<div>').width(200).height(200);
        $content.append(addedContent);

        assert.equal($content.height(), popupContentHeight + addedContent.height());
    });

    QUnit.test('dxPopup should render custom template with render function that returns dom node', function(assert) {
        const $content = $('#popup').dxPopup({
            visible: true,
            width: 'auto',
            height: 'auto',
            integrationOptions: {
                templates: {
                    'title': {
                        render: function(args) {
                            const $element = $('<span>')
                                .addClass('dx-template-wrapper')
                                .text('text');

                            return $element.get(0);
                        }
                    }
                }
            }
        });

        assert.equal($content.text(), 'text', 'container is correct');
    });

    QUnit.test('dimensions should be shrunk correctly with floating heights', function(assert) {
        const floatingTemplate = function() {
            const $result = $('<div>').width(20);
            $result.get(0).style.height = '20.2px';
            return $result;
        };
        const $content = $('<div>').appendTo('#qunit-fixture').dxPopup({
            visible: true,
            width: 'auto',
            height: 'auto',
            minHeight: 10,
            animation: null,
            toolbarItems: [{ toolbar: 'bottom' }],
            titleTemplate: floatingTemplate,
            contentTemplate: floatingTemplate,
            bottomTemplate: floatingTemplate
        }).dxPopup('instance').$content();

        const contentPaddings = $content.outerHeight() - $content.height();
        const computedContentHeight = $content.get(0).getBoundingClientRect().height - contentPaddings;

        const realContentHeight = floatingTemplate().appendTo('#qunit-fixture').get(0).getBoundingClientRect().height;
        assert.ok(Math.abs(computedContentHeight - realContentHeight) < 0.02, computedContentHeight + ' ' + realContentHeight);
    });

    QUnit.test('content height change should be correctly handled', function(assert) {
        const instance = $('#popup').dxPopup({
            'height': 100,
            'visible': true
        }).dxPopup('instance');

        const $popupContent = instance.$content();
        const $overlayContent = $popupContent.parent();
        const $contentElement = $('<div>').height(50);

        $popupContent.append($contentElement);
        instance.option('height', 'auto');
        assert.notEqual($overlayContent.height(), 100, 'auto height option');
    });

    ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach((option) => {
        QUnit.test(`overlay content should have correct ${option} attr`, function(assert) {
            const instance = $('#popup').dxPopup({
                [option]: 100,
                visible: true
            }).dxPopup('instance');

            const overlayContentElement = instance.$content().parent().get(0);

            assert.strictEqual(overlayContentElement.style[option], '100px', 'css attr value is correct');
        });

        QUnit.test(`overlay content ${option} attr should be restored after fullScreen option set to true`, function(assert) {
            const instance = $('#popup').dxPopup({
                [option]: 100,
                visible: true
            }).dxPopup('instance');

            const overlayContentElement = instance.$content().parent().get(0);

            instance.option('fullScreen', true);
            assert.strictEqual(overlayContentElement.style[option], '', 'css attr value is restored');
        });
    });

    QUnit.test('minHeight should affect popup content height correctly', function(assert) {
        const $popup = $('#popup').dxPopup({
            visible: true,
            width: 'auto',
            height: 'auto',
            minHeight: 400,
            toolbarItems: [{ text: 'text', toolbar: 'top', location: 'center' }, { text: 'text', toolbar: 'bottom', location: 'center' }],
            titleTemplate: function() { return $('<div>').width('100%').height(100); },
            bottomTemplate: function() { return $('<div>').width('100%').height(100); },
            contentTemplate: function() { return $('<div>').width(1000).height(0); }
        });
        const instance = $popup.dxPopup('instance');
        const $popupContent = instance.$content();
        const $overlayContent = $popupContent.parent();
        const $popupTitle = $overlayContent.find('.dx-popup-title');
        const $popupBottom = $overlayContent.find('.dx-popup-bottom');

        assert.equal(
            $popupContent.outerHeight(true) + $popupTitle.outerHeight(true) + $popupBottom.outerHeight(true),
            $overlayContent.height()
        );
    });

    QUnit.test('maxHeight should affect popup content height correctly', function(assert) {
        const $popup = $('#popup').dxPopup({
            visible: true,
            width: 'auto',
            height: 'auto',
            maxHeight: 400,
            toolbarItems: [{ text: 'text', toolbar: 'top', location: 'center' }, { text: 'text', toolbar: 'bottom', location: 'center' }],
            titleTemplate: function() { return $('<div>').width('100%').height(100); },
            bottomTemplate: function() { return $('<div>').width('100%').height(100); },
            contentTemplate: function() { return $('<div>').width(1000).height(1000); }
        });
        const instance = $popup.dxPopup('instance');
        const $popupContent = instance.$content();
        const $overlayContent = $popupContent.parent();
        const $popupTitle = $overlayContent.find('.dx-popup-title');
        const $popupBottom = $overlayContent.find('.dx-popup-bottom');

        assert.equal(
            $popupContent.outerHeight(true) + $popupTitle.outerHeight(true) + $popupBottom.outerHeight(true),
            $overlayContent.height()
        );
    });

    QUnit.module('Popup should keep nested scroll position on geometry rerendering', {
        beforeEach: function() {
            const SCROLLABLE_CONTAINER_CLASS = 'test-scroll';
            this.instance = $('#popup').dxPopup({
                visible: true,
                resizeEnabled: true,
                width: 'auto',
                contentTemplate: () => {
                    const $content = $('<div>').height(3000);
                    const $wrapper = $('<div>');

                    return $wrapper
                        .addClass(SCROLLABLE_CONTAINER_CLASS)
                        .css({
                            height: '100%',
                            width: 50,
                            overflow: 'auto'
                        })
                        .append($content);
                }
            }).dxPopup('instance');
            this.$scrollableContainer = $(`.${SCROLLABLE_CONTAINER_CLASS}`);
            this.$scrollableContainer.scrollTop(300);
        }
    }, () => {
        QUnit.test('on window resize', function(assert) {
            assert.strictEqual(this.$scrollableContainer.scrollTop(), 300, 'scroll position is set');

            resizeCallbacks.fire();
            assert.strictEqual(this.$scrollableContainer.scrollTop(), 300, 'scroll position is not changed');
        });

        QUnit.test('on dimension option change', function(assert) {
            this.instance.option('width', 100);

            assert.strictEqual(this.$scrollableContainer.scrollTop(), 300, 'scroll position is not changed');
        });

        QUnit.test('on content dimension change', function(assert) {
            const showingObserved = assert.async();
            const contentResizingObserved = assert.async();
            setTimeout(() => {
                this.$scrollableContainer.width(300);
                setTimeout(() => {
                    assert.strictEqual(this.$scrollableContainer.scrollTop(), 300, 'scroll position is not changed');
                    contentResizingObserved();
                }, 100);
                showingObserved();
            });
        });

        QUnit.test('on resize', function(assert) {
            const $overlayContent = this.instance.$overlayContent();
            const $handle = $overlayContent.find('.dx-resizable-handle-right');
            const pointer = pointerMock($handle);

            pointer.start().dragStart().drag(100).dragEnd();

            assert.strictEqual(this.$scrollableContainer.scrollTop(), 300, 'scroll position is not changed');
        });
    });

    QUnit.module('popup should be repositioned correctly after change height', {
        beforeEach: function() {
            this.getCenterY = (rect) => {
                return (rect.bottom + rect.top) / 2;
            };
            this.popup = $('#popup').dxPopup({
                visible: true,
                height: 500,
                contentTemplate: function($container) {
                    return $('<div>').height(100);
                }
            }).dxPopup('instance');

            this.contentElement = this.popup.$content().get(0);
            this.initialContentRect = this.contentElement.getBoundingClientRect();
        }
    }, () => {
        QUnit.test('from static to "auto"', function(assert) {
            this.popup.option('height', 'auto');

            const contentRect = this.contentElement.getBoundingClientRect();
            assert.roughEqual(this.getCenterY(contentRect), this.getCenterY(this.initialContentRect), 0.51, 'popup is repositioned correctly');
        });

        QUnit.test('from static to function which returns "auto"', function(assert) {
            this.popup.option('height', () => 'auto');

            const contentRect = this.contentElement.getBoundingClientRect();
            assert.roughEqual(this.getCenterY(contentRect), this.getCenterY(this.initialContentRect), 0.51, 'popup is repositioned correctly');
        });
    });
});

QUnit.module('options changed callbacks', {
    beforeEach: function() {
        this.element = $('#popup').dxPopup();
        this.instance = this.element.dxPopup('instance');
        devices.current('desktop');
        fx.off = true;
        this.clock = sinon.useFakeTimers();
        return new Promise((resolve) => themes.initialized(resolve));
    },

    afterEach: function() {
        fx.off = false;
        this.clock.restore();
    }
}, () => {
    QUnit.test('width/height', function(assert) {
        const instance = this.instance;

        instance.show();

        const $overlayContent = instance.$content().parent();

        instance.option('width', 345);
        assert.equal($overlayContent.outerWidth(), 345);

        instance.option('height', 567);
        assert.equal($overlayContent.outerHeight(), 567);
    });

    QUnit.test('popup height can be changed according to the content if height = auto', function(assert) {
        const $content = $('<div>').attr('id', 'content');
        const minHeight = 100;
        const popup = $('#popup').dxPopup({
            visible: true,
            showTitle: true,
            title: 'Information',
            height: 'auto',
            contentTemplate: () => $content.append($('<div>').height(50)),
            maxHeight: 400,
            minHeight: minHeight
        }).dxPopup('instance');

        const $popup = popup.$content().parent(`.${OVERLAY_CONTENT_CLASS}`).eq(0);
        const popupHeight = $popup.height();

        $('<div>').height(50).appendTo($content);
        assert.strictEqual($popup.height(), (popupHeight + 50), 'popup height has been changed');

        $('<div>').height(450).appendTo($content);
        assert.strictEqual($popup.outerHeight(), 400, 'popup height has been changed, it is equal to the maxHeight');

        $content.empty();
        assert.strictEqual($popup.outerHeight(), minHeight, 'popup height has been changed, it is equal to the minHeight');

        popup.option('autoResizeEnabled', false);
        $('<div>').height(450).appendTo($content);
        assert.strictEqual($popup.outerHeight(), minHeight, 'popup height does not change if autoResizeEnabled = false');

        popup.option('autoResizeEnabled', true);
        assert.strictEqual($popup.outerHeight(), 400, 'popup height has been changed after \'autoResizeEnabled\' change');

        popup.option('width', 'auto');
        $content.empty();

        assert.strictEqual($popup.outerHeight(), minHeight, 'popup with auto width can change height');
    });

    QUnit.test('popup height should support top and bottom toolbars if height = auto', function(assert) {
        const $content = $('<div>').attr('id', 'content');
        const minHeight = 170;
        const maxHeight = 400;
        const popup = $('#popup').dxPopup({
            visible: true,
            height: 'auto',
            showTitle: true,
            title: 'Information',
            toolbarItems: [{ shortcut: 'cancel' }],
            contentTemplate: () => $content,
            maxHeight: maxHeight,
            minHeight: minHeight
        }).dxPopup('instance');

        const $popup = popup.$content().parent();
        const $popupContent = popup.$content();
        const topToolbarHeight = $popup.find(`.${POPUP_TITLE_CLASS}`).eq(0).outerHeight();
        const bottomToolbarHeight = $popup.find(`.${POPUP_BOTTOM_CLASS}`).eq(0).outerHeight();
        const popupContentPadding = $popupContent.outerHeight() - $popupContent.height();
        const popupBordersHeight = parseInt($popup.css('borderTopWidth')) + parseInt($popup.css('borderBottomWidth'));

        let popupContentHeight = $popupContent.outerHeight();

        assert.strictEqual($popup.outerHeight(), minHeight, 'popup has max height');
        assert.strictEqual(popupContentHeight, minHeight - topToolbarHeight - bottomToolbarHeight - popupBordersHeight, 'popup has minimum content height');

        $('<div>').height(150).appendTo($content);
        popupContentHeight = $popupContent.innerHeight();
        assert.strictEqual(popupContentHeight, 150 + popupContentPadding, 'popup has right height');

        $('<div>').height(300).appendTo($content);
        popupContentHeight = $popupContent.innerHeight();
        assert.strictEqual($popup.outerHeight(), maxHeight, 'popup has max height');
        assert.strictEqual(popupContentHeight, maxHeight - topToolbarHeight - bottomToolbarHeight - popupBordersHeight, 'popup has maximum content height');
    });

    QUnit.test('popup height should support any maxHeight and minHeight option values if height = auto', function(assert) {
        devices.current('desktop');
        const $content = $('<div>').attr('id', 'content');
        const popup = $('#popup').dxPopup({
            visible: true,
            height: 'auto',
            showTitle: true,
            title: 'Information',
            contentTemplate: () => $content,
            maxHeight: '90%',
            minHeight: '50%'
        }).dxPopup('instance');

        const $popup = popup.$content().parent();
        const windowHeight = $(window).innerHeight();
        const $popupContent = popup.$content();
        const topToolbarHeight = $popup.find(`.${POPUP_TITLE_CLASS}`).eq(0).outerHeight();
        const popupContentPadding = $popupContent.outerHeight() - $popupContent.height();

        assert.roughEqual($popup.outerHeight(), windowHeight * 0.5, 1, 'minimum popup height in percentages');

        $('<div>').height(windowHeight).appendTo($content);
        assert.roughEqual($popup.outerHeight(), windowHeight * 0.9, 1, 'maximum popup height in percentages');

        popup.option('maxHeight', 'none');
        assert.roughEqual($popup.height(), windowHeight + popupContentPadding + topToolbarHeight, 1, 'popup maxHeight: none');

        $content.empty();
        popup.option('minHeight', 'auto');
        assert.strictEqual($popup.height(), $popup.find(`.${POPUP_TITLE_CLASS}`).outerHeight() + popupContentPadding, 'popup minHeight: auto');
        devices.current(devices.real());
    });

    QUnit.test('popup overlay should have correct height strategy classes for all browsers', function(assert) {
        const popup = $('#popup').dxPopup({
            visible: true,
            height: 'auto',
            showTitle: false,
            contentTemplate: () => $('<div>')
        }).dxPopup('instance');

        const $popup = popup.$content().parent();

        if(IS_OLD_SAFARI) {
            assert.notOk($popup.hasClass(POPUP_CONTENT_FLEX_HEIGHT_CLASS), 'has no POPUP_CONTENT_FLEX_HEIGHT_CLASS with fixed width for old safari');
            assert.ok($popup.hasClass(POPUP_CONTENT_INHERIT_HEIGHT_CLASS), 'has POPUP_CONTENT_INHERIT_HEIGHT_CLASS with fixed width for old safari');
        } else {
            assert.ok($popup.hasClass(POPUP_CONTENT_FLEX_HEIGHT_CLASS), 'has POPUP_CONTENT_FLEX_HEIGHT_CLASS with fixed width');
            assert.notOk($popup.hasClass(POPUP_CONTENT_INHERIT_HEIGHT_CLASS), 'has no POPUP_CONTENT_INHERIT_HEIGHT_CLASS with fixed width');
        }

        popup.option('width', 'auto');

        assert.ok($popup.hasClass(POPUP_CONTENT_INHERIT_HEIGHT_CLASS), 'has POPUP_CONTENT_INHERIT_HEIGHT_CLASS with auto width');
    });


    QUnit.test('popup height should support TreeView with Search if height = auto (T724029)', function(assert) {
        if(IS_OLD_SAFARI) {
            assert.expect(0);
            return;
        }

        const $content = $(
            '<div class="dx-treeview">\
            <div style="height: 30px;"></div>\
            <div class="dx-scrollable" style="height: calc(100% - 30px)">\
                <div style="height: 100px;"></div>\
            </div>\
        </div>');

        $('#popup').dxPopup({
            visible: true,
            height: 'auto',
            showTitle: false,
            contentTemplate: () => $content,
            maxHeight: 100
        });

        let treeviewContentHeight = 0;
        $content.children().each(function(_, item) { treeviewContentHeight += $(item).height(); });
        assert.roughEqual($content.height(), treeviewContentHeight, 1, 'treeview content can not be heighter than container');
    });

    QUnit.test('Set right content height if window.innerHeight was changed only (T834502)', function(assert) {
        const instance = $('#popup').dxPopup({
            showTitle: true,
            title: 'Information',
            fullScreen: true,
            visible: true,
            contentTemplate: () => $('<div>').height(150)
        }).dxPopup('instance');

        const $popup = instance.$content().parent();
        const $popupContent = instance.$content();
        const topToolbarHeight = $popup.find(`.${POPUP_TITLE_CLASS}`).eq(0).outerHeight() || 0;
        const bottomToolbarHeight = $popup.find(`.${POPUP_BOTTOM_CLASS}`).eq(0).outerHeight() || 0;
        const popupBordersHeight = parseInt($popup.css('borderTopWidth')) + parseInt($popup.css('borderBottomWidth'));

        try {
            sinon.stub(windowUtils, 'getWindow').returns({ innerHeight: 100, innerWidth: 200 });

            resizeCallbacks.fire();

            assert.roughEqual($popupContent.outerHeight() + topToolbarHeight + bottomToolbarHeight + popupBordersHeight, 100, 1);
        } finally {
            windowUtils.getWindow.restore();
        }
    });


    QUnit.test('fullScreen', function(assert) {
        this.instance.option({
            fullScreen: true,
            width: 345,
            height: 567,
            visible: true
        });

        const $overlayContent = this.instance.$content().parent();

        assert.equal($overlayContent.outerWidth(), $(document.body).outerWidth(), 'wrapper has 100% width');
        assert.equal($overlayContent.outerHeight(), $(document.body).outerHeight(), 'wrapper has 100% height');

        assert.ok($overlayContent.hasClass(POPUP_FULL_SCREEN_CLASS), 'fullscreen class added');
        assert.ok(!$overlayContent.hasClass(POPUP_NORMAL_CLASS), 'normal class is removed');

        this.instance.option('fullScreen', false);
        assert.equal($overlayContent.outerWidth(), 345);
        assert.equal($overlayContent.outerHeight(), 567);
        assert.ok(!$overlayContent.hasClass(POPUP_FULL_SCREEN_CLASS), 'fullscreen class deleted');
        assert.ok($overlayContent.hasClass(POPUP_NORMAL_CLASS), 'normal class is added');
    });

    QUnit.test('overlay wrapper should have correct size when fullScreen is enabled (T844343)', function(assert) {
        $('#container').css({
            width: 200,
            height: 200
        });

        $('#popup').dxPopup({
            fullScreen: true,
            visible: true,
            container: '#container'
        });

        const $overlayWrapper = $(`.${OVERLAY_WRAPPER_CLASS}`);

        assert.equal($overlayWrapper.outerWidth(), $(window).innerWidth(), 'wrapper has correct width');
        assert.equal($overlayWrapper.outerHeight(), $(window).innerHeight(), 'wrapper has correct height');
    });

    QUnit.test('start scroll position is saved after full screen popup hiding', function(assert) {
        let $additionalElement;

        try {
            $additionalElement = $('<div>').height(2000).appendTo('body');

            this.instance.option({
                fullScreen: true,
                visible: false
            });

            window.scrollTo(0, 100);
            this.instance.show();
            this.instance.hide();

            assert.strictEqual(window.pageYOffset, 100);
        } finally {
            window.scrollTo(0, 0);
            $additionalElement.remove();
        }
    });

    QUnit.test('PopupContent doesn\'t disappear while fullScreen option changing', function(assert) {
        this.instance.option({
            fullScreen: false,
            width: 345,
            height: 567,
            visible: true
        });

        const popupContent = this.instance.$content();

        $('<iframe>').attr('src', 'about:blank').appendTo(popupContent);

        const iFrame = document.getElementsByTagName('iframe')[0];
        const iFrameDoc = iFrame.contentWindow.document;
        const element = document.createElement('div');

        if(iFrameDoc.body === null || iFrameDoc.body === undefined) {
            iFrameDoc.write('<body></body>');
        }

        let body = iFrameDoc.getElementsByTagName('body')[0];

        body.appendChild(element);
        this.instance.option('fullScreen', true);
        body = iFrameDoc.getElementsByTagName('body')[0];

        assert.equal(body.children.length, 1, 'Content doesn\'t disappear');
    });

    QUnit.test('fullScreen with disabled shading', function(assert) {
        this.instance.option({
            fullScreen: true,
            shading: false,
            width: 345,
            height: 567,
            visible: true
        });

        const wrapper = this.instance.$wrapper().get(0);

        assert.equal(parseInt(getComputedStyle(wrapper).width), $(window).width(), 'wrappers width specified');
        assert.equal(parseInt(getComputedStyle(wrapper).height), $(window).height(), 'wrappers height specified');
    });

    QUnit.test('title', function(assert) {
        this.instance.option('visible', 'true');
        this.instance.option('title', 'new title');
        assert.equal($(`.${POPUP_WRAPPER_CLASS}`, viewport()).text(), 'new title');
    });

    QUnit.test('showTitle option', function(assert) {
        this.instance.option({
            title: 'Title',
            showCloseButton: false,
            opened: true
        });

        let $title = $(`.${POPUP_TITLE_CLASS}`, viewport());
        assert.ok(!!$title.length, 'show title by default');

        this.instance.option('showTitle', false);
        $title = $(`.${POPUP_TITLE_CLASS}`, viewport());

        assert.ok(!$title.length, 'hide title');
    });

    QUnit.test('title toolbar should not show with showCloseButton option', function(assert) {
        this.instance.option({
            showCloseButton: true,
            title: 'Test',
            showTitle: false
        });

        assert.ok(!$('.dx-popup-title').length, 'title is hidden');
    });

    $.each(['cancel', 'clear', 'done'], function(_, buttonType) {
        QUnit.test(buttonType + ' button rendering', function(assert) {
            this.instance.option('toolbarItems', [{ shortcut: buttonType }]);
            this.instance.show();

            const $bottomBar = $(`.${POPUP_WRAPPER_CLASS}`, viewport()).find('.' + POPUP_BOTTOM_CLASS);
            const $button = $(`.${POPUP_WRAPPER_CLASS}`, viewport()).find('.dx-button.dx-popup-' + buttonType);

            assert.equal($bottomBar.length, 1, 'Bottom bar rendered');
            assert.ok($(`.${POPUP_WRAPPER_CLASS}`, viewport()).hasClass('dx-popup-' + buttonType + '-visible'), 'popup has according class');
            assert.ok($bottomBar.hasClass('dx-popup-' + buttonType), 'Bottom bar has class \'dx-popup-' + buttonType + '\'');
            assert.equal($button.length, 1, buttonType + ' button rendered');
        });
    });

    QUnit.test('buttons close button', function(assert) {
        const $popup = $('#popup').dxPopup({ visible: true, showCloseButton: true });
        const instance = $popup.dxPopup('instance');
        const $title = $(`.${POPUP_TITLE_CLASS}`, viewport());
        const $closeButton = $(`.${POPUP_TITLE_CLOSEBUTTON_CLASS}`, viewport());

        assert.equal($title.find('.dx-button').length, 1, 'title has close button');
        assert.equal($closeButton.length, 1, 'close button element');

        instance.option('toolbarItems', []);
        assert.equal($title.find('.dx-button').length, 0, 'close button is removed');
    });

    QUnit.test('сlose button options', function(assert) {
        $('#popup').dxPopup({ visible: true, showCloseButton: true });
        const $closeButton = $(`.${POPUP_TITLE_CLOSEBUTTON_CLASS}`, viewport());
        const { stylingMode, icon, onClick } = $closeButton.dxButton('instance').option();

        assert.equal(stylingMode, 'text', 'close button has correct styling mode');
        assert.equal(icon, 'close', 'close button has correct icon');
        assert.ok(!!onClick, 'close button has onclick handler');
    });

    QUnit.test('showCloseButton option', function(assert) {
        const $popup = $('#popup').dxPopup({ visible: true, toolbarItems: [] });
        const instance = $popup.dxPopup('instance');
        let $closeButton = $popup.find('.' + POPUP_TITLE_CLOSEBUTTON_CLASS);
        assert.ok($closeButton.length, 'Need to show close button by default');

        instance.option('showCloseButton', true);
        $closeButton = $popup.find('.' + POPUP_TITLE_CLOSEBUTTON_CLASS);
        assert.ok($closeButton.length, 'Close button appears when we set option to the true through api');

        instance.option('toolbarItems', [{ shortcut: 'close' }]);
        instance.option('showCloseButton', false);
        $closeButton = $popup.find('.' + POPUP_TITLE_CLOSEBUTTON_CLASS);
        assert.ok(!$closeButton.length, 'Close button is independent from the \'buttons\' option');
    });

    QUnit.test('hide popup when close button is clicked', function(assert) {
        this.instance.option('visible', 'true');
        this.instance.option('showCloseButton', true);

        const $closeButton = $(`.${POPUP_WRAPPER_CLASS}`, viewport()).find('.' + POPUP_TITLE_CLOSEBUTTON_CLASS);
        let isHideCalled = 0;

        this.instance.hide = function() {
            isHideCalled++;
        };
        $closeButton.triggerHandler('dxclick');

        assert.equal(isHideCalled, 1, 'hide is called');
    });

    $.each(['cancel', 'clear', 'done'], function(_, buttonType) {
        QUnit.test('fire specific action and hide popup' + buttonType + ' button is clicked', function(assert) {
            let buttonClickFired = 0;
            let popupHideFired = 0;

            this.instance.option('toolbarItems', [{ shortcut: buttonType, onClick: function() { buttonClickFired++; } }]);
            this.instance.hide = function() {
                popupHideFired++;
            };
            this.instance.show();

            const $button = $(`.${POPUP_WRAPPER_CLASS}`, viewport()).find('.dx-button.dx-popup-' + buttonType);

            $button.trigger('dxclick');
            assert.equal(buttonClickFired, 1, 'button click action fired');
            assert.equal(popupHideFired, 1, 'popup is hidden');
        });
    });

    QUnit.test('buttons', function(assert) {
        this.instance.option('visible', true);

        const $container = this.instance.$content().parent();
        let $popupTitle = $container.find('.' + POPUP_TITLE_CLASS);
        let $popupBottom = $container.find('.' + POPUP_BOTTOM_CLASS);

        assert.ok(!$popupTitle.hasClass('.dx-toolbar'), 'top toolbar is not initialized when buttons is empty');
        assert.equal($popupBottom.length, 0, 'bottom toolbar is not rendered when buttons is empty');

        this.instance.option('toolbarItems', [
            { text: 'test 1 top', toolbar: 'top', location: 'before' },
            { text: 'test 1 bottom', toolbar: 'bottom', location: 'before' }]
        );
        $popupTitle = $container.find('.' + POPUP_TITLE_CLASS);
        $popupBottom = $container.find('.' + POPUP_BOTTOM_CLASS);

        assert.ok($popupTitle.hasClass('dx-toolbar'), 'top toolbar is rendered after buttons option was set');
        assert.equal($popupTitle.text(), 'test 1 top', 'top toolbar value is correct');
        assert.ok($popupBottom.hasClass('dx-toolbar'), 'bottom toolbar is  rendered after buttons option was set');
        assert.equal($popupBottom.text(), 'test 1 bottom', 'bottom toolbar value is correct');

        this.instance.option('toolbarItems', [
            { widget: 'dxButton', options: { text: 'test 2 top' }, toolbar: 'top', location: 'before' },
            { widget: 'dxButton', options: { text: 'test 2 bottom' }, toolbar: 'bottom', location: 'before' }]
        );
        $popupTitle = $container.find('.' + POPUP_TITLE_CLASS);
        $popupBottom = $container.find('.' + POPUP_BOTTOM_CLASS);

        assert.equal($popupTitle.text(), 'test 2 top', 'top toolbar value is correct after buttons option is changed');
        assert.equal($popupBottom.text(), 'test 2 bottom', 'bottom toolbar value is correct after buttons option is changed');
    });

    QUnit.test('buttons aliases change affects container classes', function(assert) {
        const popup = $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{ shortcut: 'cancel' }]
        }).dxPopup('instance');

        let $popupBottom = this.instance.$content().parent().find('.' + POPUP_BOTTOM_CLASS);
        assert.ok($popupBottom.hasClass('dx-popup-cancel'), 'popup bottom has cancel class');

        popup.option('toolbarItems', [{ shortcut: 'done' }]);
        $popupBottom = this.instance.$content().parent().find('.dx-popup-bottom');
        assert.ok($popupBottom.hasClass('dx-popup-done'), 'popup bottom has done class');
        assert.ok(!$popupBottom.hasClass('dx-popup-cancel'), 'popup bottom has not cancel class');
    });

    QUnit.test('empty item should not be rendered in top toolbar', function(assert) {
        $('#popup').dxPopup({
            visible: true,
            showTitle: true,
            showCloseButton: false
        });

        const $toolbarItems = $('.' + POPUP_TITLE_CLASS).find('.dx-item');

        assert.equal($toolbarItems.length, 0, 'no items are rendered inside top toolbar');
    });

    QUnit.test('toolBar should not update geometry after toolbarItems visibility option change', function(assert) {
        const positionedHandlerStub = sinon.stub();
        this.instance.on('positioned', positionedHandlerStub);

        this.instance.option('toolbarItems[0].visible', true);
        assert.ok(positionedHandlerStub.notCalled, 'renderGeometry is not called for visibility option');

        this.instance.option('toolbarItems', [{
            widget: 'dxButton',
            options: { text: 'Supprimer', type: 'danger' }
        }]);
        assert.ok(positionedHandlerStub.notCalled, 'renderGeometry is not called for toolbarItems option fully change');

        this.instance.option('toolbarItems[0]', {
            widget: 'dxButton',
            options: { text: 'Supprimer', type: 'danger' }
        });

        assert.ok(positionedHandlerStub.notCalled, 'renderGeometry is not called for toolbarItems option partial change');
    });


    QUnit.test('toolBar should not update geometry after partial update of its items', function(assert) {
        const positionedHandlerStub = sinon.stub();
        this.instance.option({
            visible: true,
            toolbarItems: [{ widget: 'dxButton', options: { text: 'test 2 top' }, toolbar: 'bottom', location: 'after' }]
        });
        this.instance.on('positioned', positionedHandlerStub);

        this.instance.option('toolbarItems[0].options', { text: 'test', disabled: true });
        assert.ok(positionedHandlerStub.notCalled, 'renderGeometry is not called on partial update of a widget');

        this.instance.option('toolbarItems[0].toolbar', 'top');
        assert.ok(positionedHandlerStub.calledOnce, 'renderGeometry is called on item location changing');
    });

    QUnit.test('toolbarItems option change should trigger resize event for content correct geometry rendering (T934380)', function(assert) {
        const resizeEventSpy = sinon.spy(visibilityChangeUtils, 'triggerResizeEvent');

        try {
            this.instance.option({
                visible: true,
                toolbarItems: [{ widget: 'dxButton', options: { text: 'test 2 top' }, toolbar: 'bottom', location: 'after' }]
            });

            assert.ok(resizeEventSpy.calledOnce, 'resize event is triggered after option change');
        } finally {
            resizeEventSpy.restore();
        }
    });

    QUnit.test('titleTemplate option change should trigger resize event for content correct geometry rendering', function(assert) {
        this.instance.option('visible', true);
        const resizeEventSpy = sinon.spy(visibilityChangeUtils, 'triggerResizeEvent');

        try {
            this.instance.option({
                titleTemplate: () => ''
            });

            assert.ok(resizeEventSpy.calledOnce, 'resize event is triggered after option change');
        } finally {
            resizeEventSpy.restore();
        }
    });

    QUnit.test('bottomTemplate option change should trigger resize event for content correct geometry rendering', function(assert) {
        this.instance.option('visible', true);
        const resizeEventSpy = sinon.spy(visibilityChangeUtils, 'triggerResizeEvent');

        try {
            this.instance.option({
                bottomTemplate: () => ''
            });

            assert.ok(resizeEventSpy.calledOnce, 'resize event is triggered after option change');
        } finally {
            resizeEventSpy.restore();
        }
    });

    QUnit.module('prevent safari scrolling on ios devices', {
        beforeEach: function() {
            this.originalDevice = {
                platform: devices.real().platform,
                deviceType: devices.real().deviceType
            };
            devices.real({ platform: 'ios', deviceType: 'phone' });
            this.$body = $('body');
            this.$additionalElement = $('<div>').height(2000).appendTo(this.$body);
        },
        afterEach: function() {
            this.instance.dispose();
            devices.real(this.originalDevice);
            window.scrollTo(0, 0);
            this.$additionalElement.remove();
        }
    }, () => {
        QUnit.test('body should have PREVENT_SAFARI_SCROLLING_CLASS for is popup is in fullScreen mode on init', function(assert) {
            if(!IS_SAFARI) {
                assert.expect(0);
                return;
            }

            this.instance.dispose();
            $('#popup').dxPopup({
                fullScreen: true,
                visible: true,
                shading: false
            });

            assert.ok(this.$body.hasClass(PREVENT_SAFARI_SCROLLING_CLASS));
        });

        QUnit.test('body should have PREVENT_SAFARI_SCROLLING_CLASS for fullScreen popup in safari (T714801)', function(assert) {
            if(!IS_SAFARI) {
                assert.expect(0);
                return;
            }

            this.instance.option({
                fullScreen: true,
                visible: true,
                shading: false
            });

            assert.ok(this.$body.hasClass(PREVENT_SAFARI_SCROLLING_CLASS));
        });

        QUnit.test('PREVENT_SAFARI_SCROLLING_CLASS should be toggled on "fullScreen" option change', function(assert) {
            if(!IS_SAFARI) {
                assert.expect(0);
                return;
            }

            this.instance.option({
                shading: false,
                visible: true
            });
            this.instance.option('fullScreen', true);

            assert.ok(this.$body.hasClass(PREVENT_SAFARI_SCROLLING_CLASS), 'class is added when "fullScreen" is enabled');

            this.instance.option('fullScreen', false);
            assert.notOk(this.$body.hasClass(PREVENT_SAFARI_SCROLLING_CLASS), 'class is removed when "fullScreen" is disabled');
        });

        QUnit.test('PREVENT_SAFARI_SCROLLING_CLASS should be added to the body if fullScreen option is set to "true" on showing event in safari (T825004)', function(assert) {
            if(!IS_SAFARI) {
                assert.expect(0);
                return;
            }

            this.instance.option({
                shading: false,
                onShowing(e) {
                    e.component.option('fullScreen', true);
                }
            });
            const $wrapper = this.instance.$wrapper();

            window.scrollTo(0, 200);
            this.instance.show();

            assert.ok(this.$body.hasClass(PREVENT_SAFARI_SCROLLING_CLASS));
            assert.strictEqual($wrapper.css('transform').split(',')[5], ' 0)', 'popup has translateY: 0');
        });

        QUnit.test('PREVENT_SAFARI_SCROLLING_CLASS should be removed from body if fullScreen option is set to "false" on showing event in safari (T825004)', function(assert) {
            if(!IS_SAFARI) {
                assert.expect(0);
                return;
            }

            this.instance.option({
                fullScreen: true,
                shading: false,
                onShowing(e) {
                    e.component.option('fullScreen', false);
                }
            });

            window.scrollTo(0, 200);
            this.instance.show();

            assert.notOk(this.$body.hasClass(PREVENT_SAFARI_SCROLLING_CLASS), 'class is removed from body on fullScreen disable');
            assert.strictEqual(window.pageYOffset, 200, 'scroll position is correct');
        });
    });
});

QUnit.module('resize', {
    beforeEach: function() {
        fx.off = true;
    },
    afterEach: function() {
        fx.off = false;
    }
}, () => {
    QUnit.test('popup content should update height after resize', function(assert) {
        const $popup = $('#popup').dxPopup({
            resizeEnabled: true,
            showTitle: false,
            visible: true,
            showCloseButton: false,
            toolbarItems: []
        });
        const popup = $popup.dxPopup('instance');
        const $overlayContent = popup.$content().parent();
        const $handle = $overlayContent.find('.dx-resizable-handle-corner-bottom-right');
        const pointer = pointerMock($handle).start();

        pointer.dragStart().drag(-100, -100);
        assert.roughEqual(popup.$content().outerHeight(), $overlayContent.height(), 0.1, 'size of popup and overlay is equal');
    });

    QUnit.test('popup content position should be reset after show/hide', function(assert) {
        const $popup = $('#popup').dxPopup({
            resizeEnabled: true,
            height: 'auto'
        });
        const popup = $popup.dxPopup('instance');
        const $overlayContent = popup.$content().parent();

        popup.$content().append($('<div>').height(10));
        popup.show();
        const $handle = $overlayContent.find('.dx-resizable-handle-corner-bottom-right');
        const pointer = pointerMock($handle);
        const position = $overlayContent.offset();
        pointer.start().dragStart().drag(-100, -100).dragEnd();

        popup.hide();
        popup.show();
        assert.deepEqual($overlayContent.offset(), position, 'position is same');
    });

    QUnit.test('resize callbacks', function(assert) {
        const onResizeStartStub = sinon.stub();
        const onResizeStub = sinon.stub();
        const onResizeEndStub = sinon.stub();

        const instance = $('#popup').dxPopup({
            resizeEnabled: true,
            visible: true,
            onResizeStart: onResizeStartStub,
            onResize: onResizeStub,
            onResizeEnd: onResizeEndStub
        }).dxPopup('instance');

        const $content = instance.$overlayContent();
        const $handle = $content.find('.dx-resizable-handle-top');
        const pointer = pointerMock($handle);

        pointer.start().dragStart().drag(0, 50).dragEnd();

        assert.ok(onResizeStartStub.calledOnce, 'onResizeStart fired');
        assert.ok(onResizeStub.calledOnce, 'onResize fired');
        assert.ok(onResizeEndStub.calledOnce, 'onResizeEnd fired');
    });

    QUnit.test('resize event handlers should correctly added via "on" method', function(assert) {
        const onResizeStartStub = sinon.stub();
        const onResizeStub = sinon.stub();
        const onResizeEndStub = sinon.stub();

        const instance = $('#popup').dxPopup({
            resizeEnabled: true
        }).dxPopup('instance');

        instance.on('resize', onResizeStub);
        instance.on('resizeStart', onResizeStartStub);
        instance.on('resizeEnd', onResizeEndStub);
        instance.show();

        const $content = instance.$overlayContent();
        const $handle = $content.find('.dx-resizable-handle-top');
        const pointer = pointerMock($handle);

        pointer.start().dragStart().drag(0, 50).dragEnd();

        assert.ok(onResizeStartStub.calledOnce, 'onResizeStart fired');
        assert.ok(onResizeStub.calledOnce, 'onResize fired');
        assert.ok(onResizeEndStub.calledOnce, 'onResizeEnd fired');
    });
});

QUnit.module('drag popup by title', {
    beforeEach: function() {
        fx.off = true;
    },
    afterEach: function() {
        fx.off = false;
    }
}, () => {
    QUnit.test('class should be added if drag is enabled', function(assert) {
        const $popup = $('#popup').dxPopup({
            dragEnabled: true,
            visible: true
        });
        const popup = $popup.dxPopup('instance');
        const $overlayContent = popup.$content().parent();

        assert.ok($overlayContent.hasClass(POPUP_DRAGGABLE_CLASS), 'class was added');

        popup.option('dragEnabled', false);
        assert.ok(!$overlayContent.hasClass(POPUP_DRAGGABLE_CLASS), 'class was added');
    });

    QUnit.test('popup should be dragged by title', function(assert) {
        const $popup = $('#popup').dxPopup({
            dragEnabled: true,
            visible: true
        });
        const popup = $popup.dxPopup('instance');
        const $overlayContent = popup.$content().parent();
        const $title = $overlayContent.children(`.${POPUP_TITLE_CLASS}`);
        const pointer = pointerMock($title);
        const position = $overlayContent.position();

        pointer.start().dragStart().drag(50, 50).dragEnd();

        assert.deepEqual($overlayContent.position(), {
            top: position.top + 50,
            left: position.left + 50
        }, 'popup was moved');
    });

    QUnit.test('popup shouldn\'t be dragged by content', function(assert) {
        const $popup = $('#popup').dxPopup({
            dragEnabled: true,
            visible: true
        });
        const popup = $popup.dxPopup('instance');
        const $overlayContent = popup.$content().parent();
        const pointer = pointerMock(popup.$content());
        const position = $overlayContent.position();

        pointer.start().dragStart().drag(50, 50).dragEnd();

        assert.deepEqual($overlayContent.position(), {
            top: position.top,
            left: position.left
        }, 'popup was not moved');
    });

    QUnit.test('popup should be dragged if title was changed', function(assert) {
        const $popup = $('#popup').dxPopup({
            dragEnabled: true,
            visible: true
        });
        const popup = $popup.dxPopup('instance');
        const $overlayContent = popup.$content().parent();
        const position = $overlayContent.position();

        popup.option('title', 'newTitle');

        const $title = $overlayContent.children(`.${POPUP_TITLE_CLASS}`);
        const pointer = pointerMock($title);

        pointer.start().dragStart().drag(50, 50).dragEnd();

        assert.deepEqual($overlayContent.position(), {
            top: position.top + 50,
            left: position.left + 50
        }, 'popup was moved');
    });
});

QUnit.module('rendering', {
    beforeEach: function() {
        this.element = $('#popup').dxPopup();
        this.instance = this.element.dxPopup('instance');
        devices.current('desktop');
        return new Promise((resolve) => themes.initialized(resolve));
    }
}, () => {
    QUnit.test('anonymous content template rendering', function(assert) {
        const $inner = $('#popupWithAnonymousTmpl .testContent');
        const $popup = $('#popupWithAnonymousTmpl').dxPopup({
            visible: true
        });

        const $content = $popup.dxPopup('$content');

        assert.equal($.trim($content.text()), 'TestContent', 'content rendered');
        assert.equal($content.find('.testContent').get(0), $inner[0], 'content should not lost the link');
    });

    QUnit.test('custom content template is applied even if there is \'content\' template in popup', function(assert) {
        const $popup = $('#popupWithCustomAndContentTemplate').dxPopup({
            contentTemplate: 'custom',
            visible: true
        });

        const $content = $popup.dxPopup('$content');

        assert.equal($.trim($content.text()), 'TestContent', 'content is correct');
    });

    QUnit.test('title toolbar with buttons when \'showTitle\' is false', function(assert) {
        this.instance.option({
            showTitle: false,
            title: 'Hidden title',
            toolbarItems: [
                {
                    shortcut: 'done',
                    toolbar: 'top',
                    location: 'after'
                }
            ],
            showCloseButton: false,
            opened: true
        });

        const $title = $(`.${POPUP_TITLE_CLASS}`, viewport());

        assert.equal($title.length, 1, 'title toolbar is rendered');
        assert.equal($title.find('.dx-toolbar-button').length, 1, 'button is rendered in title toolbar');
        assert.equal($title.find('.dx-toolbar-label').length, 0, 'toolbar has no text');
    });

    QUnit.test('container argument of toolbarItems.template option is correct', function(assert) {
        this.instance.option({
            toolbarItems: [
                {
                    template: function(e, index, container) {
                        assert.equal(isRenderer(container), !!config().useJQuery, 'container is correct');
                    }
                }
            ]
        });
    });


    QUnit.test('dx-popup-fullscreen-width class should be attached when width is equal to screen width', function(assert) {
        this.instance.option('width', function() { return $(window).width(); });
        this.instance.show();
        assert.ok(this.instance.$overlayContent().hasClass('dx-popup-fullscreen-width'), 'fullscreen width class is attached');

        this.instance.option('width', function() { return $(window).width() - 1; });
        assert.ok(!this.instance.$overlayContent().hasClass('dx-popup-fullscreen-width'), 'fullscreen width class is detached');
    });

    QUnit.test('popup with toolbar should have compactMode option for the bottom toolbar', function(assert) {
        const popup = $('#popup').dxPopup({
            toolbarItems: [
                {
                    shortcut: 'done',
                    toolbar: 'bottom',
                    location: 'after'
                }
            ]
        }).dxPopup('instance');

        popup.show();

        assert.ok($('.' + POPUP_BOTTOM_CLASS).dxToolbarBase('instance').option('compactMode'), 'bottom toolbar has the compact option');
    });
});

QUnit.module('templates', () => {
    QUnit.test('titleTemplate test', function(assert) {
        assert.expect(6);

        const $element = $('#popup').dxPopup({
            visible: true,
            titleTemplate: function(titleElement) {
                let result = '<div class=\'test-title-renderer\'>';
                result += '<h1>Title</h1>';
                result += '</div>';

                assert.equal(isRenderer(titleElement), !!config().useJQuery, 'titleElement is correct');

                return result;
            }
        });
        const instance = $element.dxPopup('instance');
        const $popupContent = instance.$content().parent();

        assert.equal($popupContent.find(`.${'test-title-renderer'}`).length, 1, 'option \'titleTemplate\'  was set successfully');

        instance.option('onTitleRendered', function(e) {
            assert.equal(e.element, e.component.element(), 'element is correct');
            assert.ok(true, 'option \'onTitleRendered\' successfully passed to the popup widget raised on titleTemplate');
        });

        instance.option('titleTemplate', function(titleElement) {
            assert.equal($(titleElement).get(0), $popupContent.find('.' + POPUP_TITLE_CLASS).get(0));

            let result = '<div class=\'changed-test-title-renderer\'>';
            result += '<h1>Title</h1>';
            result += '</div>';

            return result;
        });

        assert.equal($popupContent.find(`.${'changed-test-title-renderer'}`).length, 1, 'option \'titleTemplate\' successfully passed to the popup widget');
    });

    QUnit.test('titleRendered event should be fired if was set thought method', function(assert) {
        assert.expect(1);

        const $element = $('#popup').dxPopup({
            visible: true,
            showTitle: true
        });
        const instance = $element.dxPopup('instance');

        instance.on('titleRendered', function(e) {
            assert.ok(true, 'titleRendered event handled');
        });

        instance.option('titleTemplate', () => $('<div>').text('new title'));
        instance.show();
    });

    QUnit.test('\'bottomTemplate\' options test', function(assert) {
        const $element = $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{ text: 'bottom text', toolbar: 'bottom', location: 'center' }],
            bottomTemplate: function(titleElement) {
                let result = '<div class=\'test-bottom-renderer\'>';
                result += '<h1>bottom</h1>';
                result += '</div>';

                return result;
            }
        });
        const instance = $element.dxPopup('instance');
        const $popupContent = instance.$content().parent();

        assert.equal($popupContent.find('.test-bottom-renderer').length, 1, 'option \'bottomTemplate\'  was set successfully');

        instance.option('bottomTemplate', function(titleElement) {
            assert.equal($(titleElement).get(0), $popupContent.find('.' + POPUP_BOTTOM_CLASS).get(0));

            let result = '<div class=\'changed-test-bottom-renderer\'>';
            result += '<h1>bottom</h1>';
            result += '</div>';

            return result;
        });

        assert.equal($popupContent.find('.changed-test-bottom-renderer').length, 1, 'option \'bottomTemplate\' successfully passed to the popup widget');
    });

    QUnit.test('title should be rendered if custom \'titleTemplate\' is specified and \'title\' is not set', function(assert) {
        $('#popupWithTitleTemplate').dxPopup({
            visible: true,
            titleTemplate: 'customTitle',
            toolbarItems: [],
            showCloseButton: false
        });

        const $title = $(`.${POPUP_TITLE_CLASS}`, viewport());
        assert.equal($title.length, 1, 'title is rendered');
        assert.equal($title.text(), 'testTitle', 'title template is rendered correctly');
    });

    QUnit.test('popup title should be rendered before content', function(assert) {
        let contentIsRendered = false;

        $('#popupWithTitleTemplate').dxPopup({
            visible: true,
            titleTemplate: function() {
                if(!contentIsRendered) {
                    assert.ok(true, 'Popup title is rendered before content');
                }
            },
            contentTemplate: function() {
                contentIsRendered = true;
            }
        });
    });

    [true, false].forEach((isDeferRendering) => {
        QUnit.test(`content should be append to the element when render the title with deferRendering=${isDeferRendering}`, function(assert) {
            const $widgetContainer = $('#popupWithTitleTemplate');
            $widgetContainer.dxPopup({
                deferRendering: isDeferRendering,
                visible: isDeferRendering,
                titleTemplate: function(container) {
                    const hasParentContainer = !!$(container).closest($widgetContainer).length;
                    assert.ok(hasParentContainer);
                }
            });
        });
    });

    QUnit.test('Popup toolbar should render custom template with render function passed from integrationOptions', function(assert) {
        const text = 'toolbar template';
        const popup = $('#popup').dxPopup({
            visible: true,
            width: 'auto',
            height: 'auto',
            toolbarItems: [{
                location: 'before',
                toolbar: 'bottom',
                template: 'custom'
            }],
            integrationOptions: {
                templates: {
                    'custom': {
                        render: function(args) {
                            $('<span>').text(text).appendTo(args.container);
                        }
                    }
                }
            }
        }).dxPopup('instance');

        const toolbarItemText = popup.$element().find('.dx-toolbar-item').text();
        assert.strictEqual(toolbarItemText, text, 'Custom template rendered');
    });

    QUnit.test('Popup should not pass the "content" and "title" templates via integrationOptions (T872394)', function(assert) {
        const buttonText = 'ToolbarButton';
        const titleText = 'TabTitle';
        const popup = $('#popup').dxPopup({
            visible: true,
            toolbarItems: [{
                location: 'before',
                toolbar: 'bottom',
                widget: 'dxButton',
                options: { text: buttonText }
            }, {
                location: 'before',
                toolbar: 'bottom',
                widget: 'dxTabPanel',
                options: { items: [{ title: titleText, text: 'TabText' }] }
            }],
            integrationOptions: {
                templates: {
                    'content': {
                        render: function(args) {
                            $('<div>').text('PopupContent').appendTo(args.container);
                        }
                    },
                    'title': {
                        render: function(args) {
                            $('<div>').text('PopupTitle').appendTo(args.container);
                        }
                    }
                }
            }
        }).dxPopup('instance');

        const toolbarButtonText = popup.$element().find('.dx-popup-bottom .dx-button').text();
        const toolbarTabTitleText = popup.$element().find('.dx-popup-bottom .dx-tab').text();

        assert.strictEqual(toolbarButtonText, buttonText, 'default content template rendered');
        assert.strictEqual(toolbarTabTitleText, titleText, 'default title template rendered');
    });
});

QUnit.module('renderGeometry', () => {
    QUnit.test('option change', function(assert) {
        this.positionedHandlerStub = sinon.stub();
        const instance = $('#popup').dxPopup({
            visible: true,
            onPositioned: this.positionedHandlerStub
        }).dxPopup('instance');
        const options = instance.option();
        const newOptions = {
            fullScreen: !options.fullScreen,
            autoResizeEnabled: !options.autoResizeEnabled,
            showTitle: !options.showTitle,
            title: 'test',
            titleTemplate: () => $('<div>').text('title template'),
            bottomTemplate: () => $('<div>').text('bottom template'),
            useDefaultToolbarButtons: !options.useDefaultToolbarButtons,
            useFlatToolbarButtons: !options.useFlatToolbarButtons
        };

        for(const optionName in newOptions) {
            const initialCallCount = this.positionedHandlerStub.callCount;

            instance.option(optionName, newOptions[optionName]);

            assert.ok(initialCallCount < this.positionedHandlerStub.callCount, 'renderGeomentry callCount has increased');
        }

        instance.hide();
    });

    QUnit.test('fullScreen option change to true should trigger positioned event', function(assert) {
        const positionedHandlerStub = sinon.stub();

        const instance = $('#popup').dxPopup({
            visible: true
        }).dxPopup('instance');
        instance.on('positioned', positionedHandlerStub);

        instance.option('fullScreen', true);

        assert.ok(positionedHandlerStub.calledOnce, 'positioned event is raised');
        assert.deepEqual(positionedHandlerStub.getCall(0).args[0].position, { h: { location: 0 }, v: { location: 0 } }, 'parameter is correct');
    });
});
