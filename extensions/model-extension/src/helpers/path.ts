/**
 *  try to retrieve the download file name from the source url
 */

export function extractFileName(url: string, fileExtension: string): string {
  if(!url) return fileExtension

  const extractedFileName = url.split('/').pop()
  const fileName = extractedFileName.toLowerCase().endsWith(fileExtension)
    ? extractedFileName
    : extractedFileName + fileExtension
  return fileName
}
