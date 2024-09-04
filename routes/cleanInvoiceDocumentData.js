function cleanInvoiceDocumentData(document) {
    const cleanedData = {};

    // Recursive function to clean and extract content, value, and bounding regions with polygon x,y coordinates
    function cleanFields(fields, parentKey = '', boundingRegions = []) {
        for (const [key, field] of Object.entries(fields)) {
            if (field && typeof field === 'object') {
                // If the field has value, convert it to a string
                if (field.value) {
                    if (typeof field.value === 'object') {
                        cleanedData[`${parentKey}${key}_value`] = Object.values(field.value).join(' ');
                    } else {
                        cleanedData[`${parentKey}${key}_value`] = field.value;
                    }
                }
                // If the field has boundingRegions, store them
                if (field.boundingRegions) {
                    field.boundingRegions.forEach((region, index) => {
                        cleanedData[`${parentKey}${key}_boundingRegion_${index}_pageNumber`] = region.pageNumber || null;
                        if (region.polygon) {
                            // Store polygon points as x and y coordinates
                            cleanedData[`${parentKey}${key}_boundingRegion_${index}_polygon`] = region.polygon.map(point => `${point.x},${point.y}`).join(';');
                        } else {
                            cleanedData[`${parentKey}${key}_boundingRegion_${index}_polygon`] = null;
                        }
                    });
                }
                // Recursively clean nested objects
                cleanFields(field, `${parentKey}${key}_`, field.boundingRegions || boundingRegions);
            }
        }
    }

    // Clean and extract fields
    if (document.fields) {
        cleanFields(document.fields);
    }

    // Preserve essential properties (if necessary)
    if (document.confidence !== undefined) {
        cleanedData.confidence = document.confidence;
    }
    if (document.docType) {
        cleanedData.docType = document.docType;
    }

    return cleanedData;
}

module.exports = cleanInvoiceDocumentData;