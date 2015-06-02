/**
 * Custom google-maps @event LongClick hack.
 */
function LongPress(map, maxTime) {
    this.maxTime = maxTime;
    this.isDragging = false;
    this.longPressTimer = undefined;
    this.isLongPress = false;

    var me = this;
    me.map = map;
    google.maps.event.addListener(map, 'mousedown', function(e) {
        me.onMouseDown_(e);
    });
    google.maps.event.addListener(map, 'click', function(e) {
        me.onMouseClick_(e);
    });
    google.maps.event.addListener(map, 'mouseup', function(e) {
        me.onMouseUp_(e);
    });
    google.maps.event.addListener(map, 'drag', function(e) {
        me.onMapDrag_(e);
    });
}
LongPress.prototype.onMouseClick_ = function(e) {
    this.clearTimer_();
    this.isLongPress = false;
};
LongPress.prototype.onMouseUp_ = function(e) {
    if (this.isLongPress && this.isDragging === false) {
        google.maps.event.trigger(this.map, 'longpress', e);
    }
    this.clearTimer_();
};
LongPress.prototype.onMouseDown_ = function(e) {
    var me = this;
    this.clearTimer_();
    this.longPressTimer = setTimeout(function() {
        me.isLongPress = true;
        google.maps.event.trigger(me.map, 'longpresshold', e);
    }, this.maxTime);
    this.isDragging = false;
};
LongPress.prototype.onMapDrag_ = function(e) {
    if (this.isLongPress) {
        google.maps.event.trigger(this.map, 'longpresscancel');
    }
    this.clearTimer_();
    this.isDragging = true;
};
LongPress.prototype.clearTimer_ = function(e) {
    this.isLongPress = false;
    if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = undefined;
    }
}
