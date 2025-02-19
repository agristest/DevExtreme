import HorizontalMonthLineRenderingStrategy from './strategy_horizontal_month_line';

const MONTH_APPOINTMENT_HEIGHT_RATIO = 0.6;
const MONTH_APPOINTMENT_MIN_OFFSET = 26;
const MONTH_APPOINTMENT_MAX_OFFSET = 30;
const MONTH_DROPDOWN_APPOINTMENT_MIN_RIGHT_OFFSET = 36;
const MONTH_DROPDOWN_APPOINTMENT_MAX_RIGHT_OFFSET = 60;

class HorizontalMonthRenderingStrategy extends HorizontalMonthLineRenderingStrategy {
    get dateTableOffset() { return this.options.dateTableOffset; }
    get endViewDate() { return this.options.endViewDate; }
    get getGroupWidthCallback() { return this.options.getGroupWidthCallback; }
    get adaptivityEnabled() { return this.options.adaptivityEnabled; }

    _getLeftPosition(settings) {
        const fullWeekAppointmentWidth = this._getFullWeekAppointmentWidth(settings.groupIndex);

        let result = this._calculateMultiWeekAppointmentLeftOffset(settings.hMax, fullWeekAppointmentWidth);

        // TODO get rid of this after rework date table layout
        if(this.isVerticalOrientation) {
            result += this.dateTableOffset;
        }

        return result;
    }

    _getChunkCount(fullChunksWidth, firstChunkWidth, weekWidth) {
        const rawFullChunksWidth = fullChunksWidth - firstChunkWidth + weekWidth;
        return Math.ceil(rawFullChunksWidth / weekWidth);
    }

    _getChunkWidths(geometry) {
        const firstChunkWidth = geometry.reducedWidth;
        const fullChunksWidth = Math.floor(geometry.sourceAppointmentWidth);
        const widthWithoutFirstChunk = fullChunksWidth - firstChunkWidth;

        return [firstChunkWidth, fullChunksWidth, widthWithoutFirstChunk];
    }

    _getTailChunkSettings(withoutFirstChunkWidth, weekWidth, leftPosition) {
        const tailChunkWidth = withoutFirstChunkWidth % weekWidth || weekWidth;
        const rtlPosition = leftPosition + (weekWidth - tailChunkWidth);
        const tailChunkLeftPosition = this.rtlEnabled ? rtlPosition : leftPosition;

        return [tailChunkWidth, tailChunkLeftPosition];
    }

    _getAppointmentParts(geometry, settings) {
        const result = [];

        const weekWidth = Math.round(this._getFullWeekAppointmentWidth(settings.groupIndex));
        const [firstChunkWidth, fullChunksWidth, withoutFirstChunkWidth] = this._getChunkWidths(geometry, settings, weekWidth);
        const leftPosition = this._getLeftPosition(settings);

        const hasTailChunk = this.endViewDate > settings.info.appointment.endDate;
        const chunkCount = this._getChunkCount(fullChunksWidth, firstChunkWidth, weekWidth);

        const [tailChunkWidth, tailChunkLeftPosition] = this._getTailChunkSettings(withoutFirstChunkWidth, weekWidth, leftPosition);

        for(let chunkIndex = 1; chunkIndex < chunkCount; chunkIndex++) {
            const topPosition = settings.top + this.cellHeight * chunkIndex;
            const isTailChunk = hasTailChunk && (chunkIndex === chunkCount - 1);

            result.push({ ...settings, ...{
                top: topPosition,
                left: isTailChunk ? tailChunkLeftPosition : leftPosition,
                height: geometry.height,
                width: isTailChunk ? tailChunkWidth : weekWidth,
                appointmentReduced: isTailChunk ? 'tail' : 'body',
                rowIndex: ++settings.rowIndex,
                columnIndex: 0
            } });
        }


        return result;
    }

    _calculateMultiWeekAppointmentLeftOffset(max, width) {
        return this.rtlEnabled ? max : max - width;
    }

    _getFullWeekAppointmentWidth(groupIndex) {
        this._maxFullWeekAppointmentWidth = this.getGroupWidthCallback(groupIndex);

        return this._maxFullWeekAppointmentWidth;
    }

    _getAppointmentDefaultHeight() {
        return this._getAppointmentHeightByTheme();
    }

    _getAppointmentMinHeight() {
        return this._getAppointmentDefaultHeight();
    }

    _columnCondition(a, b) {
        const conditions = this._getConditions(a, b);
        return conditions.rowCondition || conditions.columnCondition || conditions.cellPositionCondition;
    }

    createTaskPositionMap(items) {
        return super.createTaskPositionMap(items, true);
    }

    _getSortedPositions(map) {
        return super._getSortedPositions(map, true);
    }

    _getDefaultRatio() {
        return MONTH_APPOINTMENT_HEIGHT_RATIO;
    }

    _getOffsets() {
        return {
            unlimited: MONTH_APPOINTMENT_MIN_OFFSET,
            auto: MONTH_APPOINTMENT_MAX_OFFSET
        };
    }

    getDropDownAppointmentWidth(intervalCount) {
        if(this.adaptivityEnabled) {
            return this.getDropDownButtonAdaptiveSize();
        }
        const offset = intervalCount > 1 ? MONTH_DROPDOWN_APPOINTMENT_MAX_RIGHT_OFFSET : MONTH_DROPDOWN_APPOINTMENT_MIN_RIGHT_OFFSET;
        return this.cellWidth - offset;
    }

    needCorrectAppointmentDates() {
        return false;
    }

    _needVerticalGroupBounds() {
        return false;
    }

    _needHorizontalGroupBounds() {
        return true;
    }
}

export default HorizontalMonthRenderingStrategy;
