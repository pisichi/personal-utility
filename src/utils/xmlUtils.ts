import xmlFormatter from 'xml-formatter';
import { base64ToUtf8 } from './decode';
import { detectFormatType } from './formatDetector';

export function validateXml(xmlStr: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');
  const errs = doc.getElementsByTagName('parsererror');
  if (errs.length > 0) {
    return errs[0].textContent || 'XML parsing error';
  }
  return '';
}

/**
 * Specifically handles ISO20022 type messages where OrgMsg tags
 * contain base64 encoded XML or text.
 */
export function formatXmlWithOrgMsg(xmlString: string): string {
  // Regex to find tags containing "OrgMsg" in their name and their content
  // Handles <OrgMsg>, <DocumentOrgMsg>, etc.
  const processedXml = xmlString.replace(/<([^>]*OrgMsg[^>]*)>([^<]+)<\/\1>/g, (match, tagName, base64Content) => {
    try {
      const decoded = base64ToUtf8(base64Content.trim());
      const isXml = detectFormatType(decoded) === 'xml';
      
      // Recursive call to handle nested OrgMsg structures
      const formattedDecoded = isXml ? formatXmlWithOrgMsg(decoded) : decoded;
      
      return `<${tagName}>\n${formattedDecoded}\n</${tagName}>`;
    } catch (e) {
      console.warn("Failed to decode or format base64 content in OrgMsg:", e);
      return match;
    }
  });

  return xmlFormatter(processedXml, {
    indentation: '  ',
    collapseContent: true,
    lineSeparator: '\n'
  });
}
