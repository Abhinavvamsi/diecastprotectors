type DateCell =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined

const EXCEL_EPOCH_UTC =
  Date.UTC(1899, 11, 30)

const DAY_IN_MS =
  24 * 60 * 60 * 1000

function isExcelDateSerial(
  value: string | number
) {
  const numberValue =
    Number(value)

  return (
    Number.isFinite(numberValue) &&
    numberValue > 20000 &&
    numberValue < 80000
  )
}

function dateFromExcelSerial(
  value: string | number
) {
  return new Date(
    EXCEL_EPOCH_UTC +
      Math.round(Number(value)) * DAY_IN_MS
  )
}

function formatDateKey(date: Date) {
  const year =
    date.getUTCFullYear()
  const month =
    String(date.getUTCMonth() + 1).padStart(
      2,
      "0"
    )
  const day =
    String(date.getUTCDate()).padStart(
      2,
      "0"
    )

  return `${year}-${month}-${day}`
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function normalizePreOrderDeadlineCell(
  value: DateCell
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return ""
  }

  if (value instanceof Date) {
    return formatDateKey(value)
  }

  const textValue =
    String(value).trim()

  if (isExcelDateSerial(textValue)) {
    return formatDateKey(
      dateFromExcelSerial(textValue)
    )
  }

  return textValue.slice(0, 10)
}

export function normalizeExpectedArrivalCell(
  value: DateCell
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return ""
  }

  if (value instanceof Date) {
    return formatMonthYear(value)
  }

  const textValue =
    String(value).trim()

  if (isExcelDateSerial(textValue)) {
    return formatMonthYear(
      dateFromExcelSerial(textValue)
    )
  }

  return textValue
}
