/**
 * reference: https://github.com/panva/jose/blob/c7dec2f74d91e80ad2bd844d819f1f066ebd61dc/src/lib/secs.ts
 */
const minute = 60
const hour = minute * 60
const day = hour * 24
const week = day * 7
const year = day * 365.25

const REGEX
	= /^(\+|-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i

export function secs(str: string) {
	const matched = REGEX.exec(str)

	if (!matched || (matched[4] && matched[1]))
		throw new TypeError('Invalid time period format')

	const value = Number.parseFloat(matched[2]!)
	const unit = matched[3]!.toLowerCase()

	let numericDate: number

	switch (unit) {
		case 'sec':
		case 'secs':
		case 'second':
		case 'seconds':
		case 's':
			numericDate = Math.round(value)
			break
		case 'minute':
		case 'minutes':
		case 'min':
		case 'mins':
		case 'm':
			numericDate = Math.round(value * minute)
			break
		case 'hour':
		case 'hours':
		case 'hr':
		case 'hrs':
		case 'h':
			numericDate = Math.round(value * hour)
			break
		case 'day':
		case 'days':
		case 'd':
			numericDate = Math.round(value * day)
			break
		case 'week':
		case 'weeks':
		case 'w':
			numericDate = Math.round(value * week)
			break
		// years matched
		default:
			numericDate = Math.round(value * year)
			break
	}

	if (matched[1] === '-' || matched[4] === 'ago')
		return -numericDate

	return numericDate
}
