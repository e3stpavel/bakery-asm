export function getPaginationDetails(url: URL) {
  const { page, pageSize } = Object.fromEntries<string>(url.searchParams.entries())

  return {
    page: +page || 1,
    pageSize: +pageSize || 10,
  }
}
