import BasePositioningStrategy from './appointmentsPositioning_strategy_base';
import AdaptivePositioningStrategy from './appointmentsPositioning_strategy_adaptive';
import { extend } from '../../../../core/utils/extend';
import dateUtils from '../../../../core/utils/date';
import { isNumeric, isObject } from '../../../../core/utils/type';
import { current as currentTheme } from '../../../themes';
import { AppointmentSettingsGenerator } from '../settingsGenerator';

import timeZoneUtils from '../../utils.timeZone';

const toMs = dateUtils.dateToMilliseconds;

const APPOINTMENT_MIN_SIZE = 2;
const APPOINTMENT_DEFAULT_HEIGHT = 20;

const COMPACT_THEME_APPOINTMENT_DEFAULT_HEIGHT = 18;

const DROP_DOWN_BUTTON_ADAPTIVE_SIZE = 28;

class BaseRenderingStrategy {
    constructor(options) {
        this.options = options;
        this._initPositioningStrategy();
    }

    get instance() { return this.options.instance; } // TODO get rid of this
    get key() { return this.options.key; }
    get isAdaptive() { return this.options.adaptivityEnabled; }
    get rtlEnabled() { return this.options.rtlEnabled; }
    get startDayHour() { return this.options.startDayHour; }
    get endDayHour() { return this.options.endDayHour; }
    get maxAppointmentsPerCell() { return this.options.maxAppointmentsPerCell; }
    get cellWidth() { return this.options.getCellWidth(); }
    get cellHeight() { return this.options.getCellHeight(); }
    get allDayHeight() { return this.options.getAllDayHeight(); }
    get resizableStep() { return this.options.getResizableStep(); }
    get isGroupedByDate() { return this.options.getIsGroupedByDate(); }
    get visibleDayDuration() { return this.options.getVisibleDayDuration(); }
    get viewStartDayHour() { return this.options.viewStartDayHour; }
    get viewEndDayHour() { return this.options.viewEndDayHour; }

    get isVirtualScrolling() { return this.options.isVirtualScrolling; }

    _correctCollectorCoordinatesInAdaptive(coordinates, isAllDay) {
        coordinates.top = coordinates.top + this.getCollectorTopOffset(isAllDay);
        coordinates.left = coordinates.left + this.getCollectorLeftOffset();
    }

    _initPositioningStrategy() {
        this._positioningStrategy = this.isAdaptive
            ? new AdaptivePositioningStrategy(this)
            : new BasePositioningStrategy(this);
    }

    getPositioningStrategy() {
        return this._positioningStrategy;
    }

    getAppointmentMinSize() {
        return APPOINTMENT_MIN_SIZE;
    }

    keepAppointmentSettings() {
        return false;
    }

    getDeltaTime() {
    }

    getAppointmentGeometry(coordinates) {
        return coordinates;
    }

    needCorrectAppointmentDates() {
        return true;
    }

    getDirection() {
        return 'horizontal';
    }

    createTaskPositionMap(items) {
        delete this._maxAppointmentCountPerCell;

        const length = items && items.length;
        if(!length) return;

        const map = [];
        for(let i = 0; i < length; i++) {
            let coordinates = this._getItemPosition(items[i]);

            if(this.rtlEnabled) {
                coordinates = this._correctRtlCoordinates(coordinates);
            }

            map.push(coordinates);
        }

        const positionArray = this._getSortedPositions(map);
        const resultPositions = this._getResultPositions(positionArray);

        return this._getExtendedPositionMap(map, resultPositions);
    }

    _getDeltaWidth(args, initialSize) {
        const intervalWidth = this.resizableStep || this.getAppointmentMinSize();
        const initialWidth = initialSize.width;

        return Math.round((args.width - initialWidth) / intervalWidth);
    }

    _correctRtlCoordinates(coordinates) {
        const width = coordinates[0].width || this._getAppointmentMaxWidth();

        coordinates.forEach(coordinate => {
            if(!coordinate.appointmentReduced) {
                coordinate.left -= width;
            }
        });

        return coordinates;
    }

    _getAppointmentMaxWidth() {
        return this.cellWidth;
    }

    _getItemPosition(appointment) {
        const position = this.generateAppointmentSettings(appointment);
        const allDay = this.isAllDay(appointment);

        let result = [];

        for(let j = 0; j < position.length; j++) {
            const height = this.calculateAppointmentHeight(appointment, position[j]);
            const width = this.calculateAppointmentWidth(appointment, position[j]);

            let resultWidth = width;
            let appointmentReduced = null;
            let multiWeekAppointmentParts = [];
            let initialRowIndex = position[j].rowIndex;
            let initialColumnIndex = position[j].columnIndex;

            if((this._needVerifyItemSize() || allDay)) {
                const currentMaxAllowedPosition = position[j].hMax;

                if(this.isAppointmentGreaterThan(currentMaxAllowedPosition, {
                    left: position[j].left,
                    width: width
                })) {

                    appointmentReduced = 'head';

                    initialRowIndex = position[j].rowIndex;
                    initialColumnIndex = position[j].columnIndex;

                    resultWidth = this._reduceMultiWeekAppointment(
                        width,
                        {
                            left: position[j].left,
                            right: currentMaxAllowedPosition
                        }
                    );

                    multiWeekAppointmentParts = this._getAppointmentParts({
                        sourceAppointmentWidth: width,
                        reducedWidth: resultWidth,
                        height: height
                    }, position[j]);


                    if(this.rtlEnabled) {
                        position[j].left = currentMaxAllowedPosition;
                    }

                }
            }

            extend(position[j], {
                height: height,
                width: resultWidth,
                allDay: allDay,
                rowIndex: initialRowIndex,
                columnIndex: initialColumnIndex,
                appointmentReduced: appointmentReduced,
            });
            result = this._getAppointmentPartsPosition(multiWeekAppointmentParts, position[j], result);
        }

        return result;
    }

    _getAppointmentPartsPosition(appointmentParts, position, result) {
        if(appointmentParts.length) {
            appointmentParts.unshift(position);
            result = result.concat(appointmentParts);
        } else {
            result.push(position);
        }

        return result;
    }

    getAppointmentSettingsGenerator(rawAppointment) {
        return new AppointmentSettingsGenerator({
            rawAppointment,
            appointmentTakesAllDay: this.isAppointmentTakesAllDay(rawAppointment), // TODO move to the settings
            ...this.options
        });
    }
    generateAppointmentSettings(rawAppointment) {
        return this.getAppointmentSettingsGenerator(rawAppointment).create();
    }

    isAppointmentTakesAllDay(rawAppointment) {
        return this.options.appointmentDataProvider.appointmentTakesAllDay(
            rawAppointment,
            this.viewStartDayHour,
            this.viewEndDayHour
        );
    }

    _getAppointmentParts() {
        return [];
    }

    _getCompactAppointmentParts(appointmentWidth) {
        const cellWidth = this.cellWidth || this.getAppointmentMinSize();

        return Math.round(appointmentWidth / cellWidth);
    }

    _reduceMultiWeekAppointment(sourceAppointmentWidth, bound) {
        if(this.rtlEnabled) {
            sourceAppointmentWidth = Math.floor(bound.left - bound.right);
        } else {
            sourceAppointmentWidth = bound.right - Math.floor(bound.left);
        }
        return sourceAppointmentWidth;
    }

    calculateAppointmentHeight() {
        return 0;
    }

    calculateAppointmentWidth() {
        return 0;
    }

    isAppointmentGreaterThan(etalon, comparisonParameters) {
        let result = comparisonParameters.left + comparisonParameters.width - etalon;

        if(this.rtlEnabled) {
            result = etalon + comparisonParameters.width - comparisonParameters.left;
        }

        return result > this.cellWidth / 2;
    }

    isAllDay() {
        return false;
    }

    cropAppointmentWidth(width, cellWidth) { // TODO get rid of this
        return this.isGroupedByDate
            ? cellWidth
            : width;
    }

    _getSortedPositions(positionList) {
        const result = [];

        const round = value => Math.round(value * 100) / 100;
        const createItem = (rowIndex, columnIndex, top, left, bottom, right, position, allDay) => {
            return {
                i: rowIndex,
                j: columnIndex,
                top: round(top),
                left: round(left),
                bottom: round(bottom),
                right: round(right),
                cellPosition: position,
                allDay: allDay,
            };
        };

        for(let rowIndex = 0, rowCount = positionList.length; rowIndex < rowCount; rowIndex++) {
            for(let columnIndex = 0, cellCount = positionList[rowIndex].length; columnIndex < cellCount; columnIndex++) {
                const { top, left, height, width, cellPosition, allDay } = positionList[rowIndex][columnIndex];

                result.push(createItem(rowIndex, columnIndex, top, left, top + height, left + width, cellPosition, allDay));
            }
        }

        return result.sort((a, b) => this._sortCondition(a, b));
    }

    _sortCondition() {
    }

    _getConditions(a, b) {
        const isSomeEdge = this._isSomeEdge(a, b);

        return {
            columnCondition: isSomeEdge || this._normalizeCondition(a.left, b.left),
            rowCondition: isSomeEdge || this._normalizeCondition(a.top, b.top),
            cellPositionCondition: isSomeEdge || this._normalizeCondition(a.cellPosition, b.cellPosition)
        };
    }

    _rowCondition(a, b) {
        const conditions = this._getConditions(a, b);
        return conditions.columnCondition || conditions.rowCondition;
    }

    _columnCondition(a, b) {
        const conditions = this._getConditions(a, b);
        return conditions.rowCondition || conditions.columnCondition;
    }

    _isSomeEdge(a, b) {
        return a.i === b.i && a.j === b.j;
    }

    _normalizeCondition(first, second) {
        // NOTE: ie & ff pixels
        const result = first - second;
        return Math.abs(result) > 1 ? result : 0;
    }

    _isItemsCross(firstItem, secondItem) {
        const areItemsInTheSameTable = !!firstItem.allDay === !!secondItem.allDay;
        const areItemsAllDay = firstItem.allDay && secondItem.allDay;

        if(areItemsInTheSameTable) {
            const orientation = this._getOrientation(areItemsAllDay);

            return this._checkItemsCrossing(firstItem, secondItem, orientation);
        } else {
            return false;
        }
    }

    _checkItemsCrossing(firstItem, secondItem, orientation) {
        const firstItemSide_1 = Math.floor(firstItem[orientation[0]]);
        const firstItemSide_2 = Math.floor(firstItem[orientation[1]]);

        const secondItemSide_1 = Math.ceil(secondItem[orientation[0]]);
        const secondItemSide_2 = Math.ceil(secondItem[orientation[1]]);

        const isItemCross = Math.abs(firstItem[orientation[2]] - secondItem[orientation[2]]) <= 1;
        return isItemCross && (
            (firstItemSide_1 <= secondItemSide_1 && firstItemSide_2 > secondItemSide_1) ||
                (firstItemSide_1 < secondItemSide_2 && firstItemSide_2 >= secondItemSide_2 || (
                    firstItemSide_1 === secondItemSide_1 && firstItemSide_2 === secondItemSide_2
                ))
        );
    }

    _getOrientation(isAllDay) {
        return isAllDay ? ['left', 'right', 'top'] : ['top', 'bottom', 'left'];
    }

    _getResultPositions(sortedArray) {
        const result = [];
        let i;
        let sortedIndex = 0;
        let currentItem;
        let indexes;
        let itemIndex;
        let maxIndexInStack = 0;
        let stack = {};

        const findFreeIndex = (indexes, index) => {
            const isFind = indexes.some((item) => {
                return item === index;
            });
            if(isFind) {
                return findFreeIndex(indexes, ++index);
            } else {
                return index;
            }
        };

        const createItem = (currentItem, index) => {
            const currentIndex = index || 0;
            return {
                index: currentIndex,
                i: currentItem.i,
                j: currentItem.j,
                left: currentItem.left,
                right: currentItem.right,
                top: currentItem.top,
                bottom: currentItem.bottom,
                allDay: currentItem.allDay,
                sortedIndex: this._skipSortedIndex(currentIndex) ? null : sortedIndex++,
            };
        };


        const startNewStack = (currentItem) => {
            stack.items = [createItem(currentItem)];
            stack.left = currentItem.left;
            stack.right = currentItem.right;
            stack.top = currentItem.top;
            stack.bottom = currentItem.bottom;
            stack.allDay = currentItem.allDay;
        };
        const pushItemsInResult = (items) => {
            items.forEach((item) => {
                result.push({
                    index: item.index,
                    count: maxIndexInStack + 1,
                    i: item.i,
                    j: item.j,
                    sortedIndex: item.sortedIndex
                });
            });
        };

        for(i = 0; i < sortedArray.length; i++) {
            currentItem = sortedArray[i];
            indexes = [];

            if(!stack.items) {
                startNewStack(currentItem);
            } else {
                if(this._isItemsCross(stack, currentItem)) {
                    stack.items.forEach((item, index) => {
                        if(this._isItemsCross(item, currentItem)) {
                            indexes.push(item.index);
                        }
                    });
                    itemIndex = indexes.length ? findFreeIndex(indexes, 0) : 0;
                    stack.items.push(createItem(currentItem, itemIndex));
                    maxIndexInStack = Math.max(itemIndex, maxIndexInStack);
                    stack.left = Math.min(stack.left, currentItem.left);
                    stack.right = Math.max(stack.right, currentItem.right);
                    stack.top = Math.min(stack.top, currentItem.top);
                    stack.bottom = Math.max(stack.bottom, currentItem.bottom);
                    stack.allDay = currentItem.allDay;
                } else {
                    pushItemsInResult(stack.items);
                    stack = {};
                    startNewStack(currentItem);
                    maxIndexInStack = 0;
                }
            }
        }
        if(stack.items) {
            pushItemsInResult(stack.items);
        }

        return result.sort(function(a, b) {
            const columnCondition = a.j - b.j;
            const rowCondition = a.i - b.i;
            return rowCondition ? rowCondition : columnCondition;
        });
    }

    _skipSortedIndex(index) {
        return index > this._getMaxAppointmentCountPerCell() - 1;
    }

    _findIndexByKey(arr, iKey, jKey, iValue, jValue) {
        let result = 0;
        for(let i = 0, len = arr.length; i < len; i++) {
            if(arr[i][iKey] === iValue && arr[i][jKey] === jValue) {
                result = i;
                break;
            }
        }
        return result;
    }

    _getExtendedPositionMap(map, positions) {
        let positionCounter = 0;
        const result = [];
        for(let i = 0, mapLength = map.length; i < mapLength; i++) {
            const resultString = [];
            for(let j = 0, itemLength = map[i].length; j < itemLength; j++) {
                map[i][j].index = positions[positionCounter].index;
                map[i][j].sortedIndex = positions[positionCounter].sortedIndex;
                map[i][j].count = positions[positionCounter++].count;
                resultString.push(map[i][j]);
                this._checkLongCompactAppointment(map[i][j], resultString);
            }
            result.push(resultString);
        }
        return result;
    }

    _checkLongCompactAppointment(item, result) {
        this._splitLongCompactAppointment(item, result);

        return result;
    }

    _splitLongCompactAppointment(item, result) {
        const appointmentCountPerCell = this._getMaxAppointmentCountPerCellByType(item.allDay);
        let compactCount = 0;

        if(appointmentCountPerCell !== undefined && item.index > appointmentCountPerCell - 1) {
            item.isCompact = true;
            compactCount = this._getCompactAppointmentParts(item.width);
            for(let k = 1; k < compactCount; k++) {
                const compactPart = extend(true, {}, item);
                compactPart.left = this._getCompactLeftCoordinate(item.left, k);
                compactPart.columnIndex = compactPart.columnIndex + k;
                compactPart.sortedIndex = null;
                result.push(compactPart);
            }
        }
        return result;
    }

    _adjustDurationByDaylightDiff(duration, startDate, endDate) {
        const daylightDiff = timeZoneUtils.getDaylightOffset(startDate, endDate);
        return this._needAdjustDuration(daylightDiff) ? this._calculateDurationByDaylightDiff(duration, daylightDiff) : duration;
    }

    _needAdjustDuration(diff) {
        return diff !== 0;
    }

    _calculateDurationByDaylightDiff(duration, diff) {
        return duration + diff * toMs('minute');
    }

    _markAppointmentAsVirtual(coordinates, isAllDay = false) {
        const countFullWidthAppointmentInCell = this._getMaxAppointmentCountPerCellByType(isAllDay);
        if((coordinates.count - countFullWidthAppointmentInCell) > 0) {
            const { top, left } = coordinates;
            coordinates.virtual = {
                top,
                left,
                index: this._generateAppointmentCollectorIndex(coordinates, isAllDay),
                isAllDay,
            };
        }
    }

    _generateAppointmentCollectorIndex({
        groupIndex, rowIndex, columnIndex,
    }, isAllDay) {
        return `${groupIndex}-${rowIndex}-${columnIndex}-${isAllDay}`;
    }

    _getMaxAppointmentCountPerCellByType(isAllDay) {
        const appointmentCountPerCell = this._getMaxAppointmentCountPerCell();

        if(isObject(appointmentCountPerCell)) {
            return isAllDay ? this._getMaxAppointmentCountPerCell().allDay : this._getMaxAppointmentCountPerCell().simple;
        } else {
            return appointmentCountPerCell;
        }
    }

    getDropDownAppointmentWidth(intervalCount, isAllDay) {
        return this.getPositioningStrategy().getDropDownAppointmentWidth(intervalCount, isAllDay);
    }

    getDropDownAppointmentHeight() {
        return this.getPositioningStrategy().getDropDownAppointmentHeight();
    }

    getDropDownButtonAdaptiveSize() {
        return DROP_DOWN_BUTTON_ADAPTIVE_SIZE;
    }

    getCollectorTopOffset(allDay) {
        return this.getPositioningStrategy().getCollectorTopOffset(allDay);
    }

    getCollectorLeftOffset() {
        return this.getPositioningStrategy().getCollectorLeftOffset();
    }

    getAppointmentDataCalculator() {
    }

    _customizeCoordinates(coordinates, height, appointmentCountPerCell, topOffset, isAllDay) {
        const index = coordinates.index;
        const appointmentHeight = height / appointmentCountPerCell;
        const appointmentTop = coordinates.top + (index * appointmentHeight);
        const top = appointmentTop + topOffset;
        const width = coordinates.width;
        const left = coordinates.left;

        if(coordinates.isCompact) {
            this.isAdaptive && this._correctCollectorCoordinatesInAdaptive(coordinates, isAllDay);

            this._markAppointmentAsVirtual(coordinates, isAllDay);
        }
        return {
            height: appointmentHeight,
            width: width,
            top: top,
            left: left,
            empty: this._isAppointmentEmpty(height, width)
        };
    }

    _isAppointmentEmpty(height, width) {
        return height < this._getAppointmentMinHeight() || width < this._getAppointmentMinWidth();
    }

    _calculateGeometryConfig(coordinates) {
        const overlappingMode = this.maxAppointmentsPerCell;
        const offsets = this._getOffsets();
        const appointmentDefaultOffset = this._getAppointmentDefaultOffset();

        let appointmentCountPerCell = this._getAppointmentCount(overlappingMode, coordinates);
        let ratio = this._getDefaultRatio(coordinates, appointmentCountPerCell);
        let maxHeight = this._getMaxHeight();

        if(!isNumeric(appointmentCountPerCell)) {
            appointmentCountPerCell = coordinates.count;
            ratio = (maxHeight - offsets.unlimited) / maxHeight;
        }

        let topOffset = (1 - ratio) * maxHeight;
        if(overlappingMode === 'auto' || isNumeric(overlappingMode)) {
            ratio = 1;
            maxHeight = maxHeight - appointmentDefaultOffset;
            topOffset = appointmentDefaultOffset;
        }

        return {
            height: ratio * maxHeight,
            appointmentCountPerCell: appointmentCountPerCell,
            offset: topOffset
        };
    }

    _getAppointmentCount() {
    }

    _getDefaultRatio() {
    }

    _getOffsets() {
    }

    _getMaxHeight() {
    }

    _needVerifyItemSize() {
        return false;
    }

    _getMaxAppointmentCountPerCell() {
        if(!this._maxAppointmentCountPerCell) {
            const overlappingMode = this.maxAppointmentsPerCell;
            let appointmentCountPerCell;

            if(isNumeric(overlappingMode)) {
                appointmentCountPerCell = overlappingMode;
            }
            if(overlappingMode === 'auto') {
                appointmentCountPerCell = this._getDynamicAppointmentCountPerCell();
            }
            if(overlappingMode === 'unlimited') {
                appointmentCountPerCell = undefined;
            }

            this._maxAppointmentCountPerCell = appointmentCountPerCell;
        }

        return this._maxAppointmentCountPerCell;
    }

    _getDynamicAppointmentCountPerCell() {
        return this.getPositioningStrategy().getDynamicAppointmentCountPerCell();
    }

    hasAllDayAppointments() {
        return false;
    }

    _isCompactTheme() {
        return (currentTheme() || '').split('.').pop() === 'compact';
    }

    _getAppointmentDefaultOffset() {
        return this.getPositioningStrategy().getAppointmentDefaultOffset();
    }

    _getAppointmentDefaultHeight() {
        return this._getAppointmentHeightByTheme();
    }

    _getAppointmentMinHeight() {
        return this._getAppointmentDefaultHeight();
    }

    _getAppointmentHeightByTheme() { // TODO get rid of depending from themes
        return this._isCompactTheme()
            ? COMPACT_THEME_APPOINTMENT_DEFAULT_HEIGHT
            : APPOINTMENT_DEFAULT_HEIGHT;
    }

    _getAppointmentDefaultWidth() {
        return this.getPositioningStrategy()._getAppointmentDefaultWidth();
    }

    _getAppointmentMinWidth() {
        return this._getAppointmentDefaultWidth();
    }

    _needVerticalGroupBounds() {
        return false;
    }

    _needHorizontalGroupBounds() {
        return false;
    }

    getAppointmentDurationInMs(startDate, endDate, allDay) {
        const appointmentDuration = endDate.getTime() - startDate.getTime();
        const dayDuration = toMs('day');
        const visibleDayDuration = this.visibleDayDuration;
        let result = 0;

        if(allDay) {
            const ceilQuantityOfDays = Math.ceil(appointmentDuration / dayDuration);

            result = ceilQuantityOfDays * visibleDayDuration;
        } else {
            const isDifferentDates = !timeZoneUtils.isSameAppointmentDates(startDate, endDate);
            const floorQuantityOfDays = Math.floor(appointmentDuration / dayDuration);
            let tailDuration;

            if(isDifferentDates) {
                const startDateEndHour = new Date(new Date(startDate).setHours(this.endDayHour, 0, 0));
                const hiddenDayDuration = dayDuration - visibleDayDuration - (startDate.getTime() > startDateEndHour.getTime() ? startDate.getTime() - startDateEndHour.getTime() : 0);

                tailDuration = appointmentDuration - (floorQuantityOfDays ? floorQuantityOfDays * dayDuration : hiddenDayDuration);

                const startDayTime = this.startDayHour * toMs('hour');
                const endPartDuration = endDate - dateUtils.trimTime(endDate);

                if(endPartDuration < startDayTime) {
                    if(floorQuantityOfDays) {
                        tailDuration -= hiddenDayDuration;
                    }

                    tailDuration += startDayTime - endPartDuration;
                }
            } else {
                tailDuration = appointmentDuration % dayDuration;
            }

            if(tailDuration > visibleDayDuration) {
                tailDuration = visibleDayDuration;
            }

            result = (floorQuantityOfDays * visibleDayDuration + tailDuration) || toMs('minute');
        }

        return result;
    }


}

export default BaseRenderingStrategy;
