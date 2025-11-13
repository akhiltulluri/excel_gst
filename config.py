# DEFAULTS
B2B_COLUMN_MAP = {
    10: "B2B Taxable values",
    11: "B2B Integrated tax",
    12: "B2B Central tax",
    13: "B2B State tax",
    14: "B2B Cess",
}

CDNR_DEBIT_COLUMN_MAP = {
    11: "CDNR Debit Taxable values",
    12: "CDNR Debit Integrated tax",
    13: "CDNR Debit Central tax",
    14: "CDNR Debit State tax",
    15: "CDNR Debit Cess",
}

CDNR_CREDIT_COLUMN_MAP = {
    11: "CDNR Credit Taxable values",
    12: "CDNR Credit Integrated tax",
    13: "CDNR Credit Central tax",
    14: "CDNR Credit State tax",
    15: "CDNR Credit Cess",
}
COLUMNS_LENGTH = 5

WORKSHEET_PRIMARY_HEADINGS = {"B2B": 2, "B2B (supply Y)": 7, "CDNR Debit": 12, "CDNR Credit": 17}
WORKSHEET_SECONDARY_HEADINGS = {
    2: "Value",
    3: "IGST",
    4: "CGST",
    5: "SGST",
    6: "Cess",
    7: "Value",
    8: "IGST",
    9: "CGST",
    10: "SGST",
    11: "Cess",
    12: "Value",
    13: "IGST",
    14: "CGST",
    15: "SGST",
    16: "Cess",
    17: "Value",
    18: "IGST",
    19: "CGST",
    20: "SGST",
    21: "Cess",
}
B2B_CHECK_MAP = {9: "-"}
B2B_SUPPLY_Y_CHECK_MAP = {9: "-", 8: "Y"}
CDNR_DEBIT_CHECK_MAP = {10: "-", 3: "Debit note"}
CDNR_CREDIT_CHECK_MAP = {10: "-", 3: "Credit note"}
FILENAME_AS_MONTH = False
PANDAS_MODE = False

# OVERWRITES

# B2B_COLUMN_MAP = {
#     9: "B2B Taxable values",
#     10: "B2B Integrated tax",
#     11: "B2B Central tax",
#     12: "B2B State tax",
#     13: "B2B Cess",
# }

# B2B_CHECK_MAP = {8: "-"}

# FILENAME_AS_MONTH = True