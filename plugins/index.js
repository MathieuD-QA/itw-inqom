const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const advancedFormat = require('dayjs/plugin/advancedFormat')
const duration = require('dayjs/plugin/duration')
const isBetween = require('dayjs/plugin/isBetween')
const minMax = require('dayjs/plugin/minMax')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(duration)
dayjs.extend(isBetween)
dayjs.extend(minMax)

module.exports = dayjs
