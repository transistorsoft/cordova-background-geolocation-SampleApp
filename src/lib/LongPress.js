/**
 * Custom google-maps @event LongClick hack.
 */
var LongPress = (function () {
    function LongPress(map, maxTime) {
        var _this = this;
        this.maxTime = maxTime;
        this.map = map;
        this.longPressTimer = undefined;
        this.isLongPress = false;
        google.maps.event.addListener(map, 'mousedown', function (e) {
            _this.onMouseDown(e);
        });
        google.maps.event.addListener(map, 'click', function (e) {
            _this.onMouseClick(e);
        });
        google.maps.event.addListener(map, 'mouseup', function (e) {
            _this.onMouseUp(e);
        });
        google.maps.event.addListener(map, 'drag', function (e) {
            _this.onMapDrag(e);
        });
    }
    LongPress.prototype.onMouseClick = function (e) {
        this.clearTimer();
        this.isLongPress = false;
    };
    LongPress.prototype.onMouseUp = function (e) {
        if (this.isLongPress && this.isDragging === false) {
            google.maps.event.trigger(this.map, 'longpress', e);
        }
        this.clearTimer();
    };
    LongPress.prototype.onMouseDown = function (e) {
        var _this = this;
        this.clearTimer();
        this.longPressTimer = setTimeout(function () {
            _this.isLongPress = true;
            google.maps.event.trigger(_this.map, 'longpresshold', e);
        }, this.maxTime);
        this.isDragging = false;
    };
    LongPress.prototype.onMapDrag = function (e) {
        if (this.isLongPress) {
            google.maps.event.trigger(this.map, 'longpresscancel');
        }
        this.clearTimer();
        this.isDragging = true;
    };
    LongPress.prototype.clearTimer = function () {
        this.isLongPress = false;
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = undefined;
        }
    };
    return LongPress;
}());
export { LongPress };
//# sourceMappingURL=LongPress.js.map