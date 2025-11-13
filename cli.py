import os

import openpyxl
from openpyxl import Workbook

import config
import excel


def get_folder_input_paths(folder_path):
    input_paths = []
    for root, _, files in os.walk(folder_path):
        for filename in files:
            if filename.endswith(".xlsx"):
                input_paths.append(os.path.join(root, filename))
    return input_paths


def runCalculator(inputPaths, outputDestination, outputFileName):
    try:
        workbooks = [
            openpyxl.load_workbook(inputPath) for inputPath in inputPaths
        ]
        new_workbook = Workbook()
        new_worksheet = new_workbook.active
        new_worksheet.title = "Result"
        # Resolve Headings
        excel.resolve_headings(worksheet=new_worksheet)

        inital_row = 3
        for workbook in workbooks:
            # Insert Month
            if config.FILENAME_AS_MONTH:
                workbook_index = workbooks.index(workbook)
                filePath = inputPaths[workbook_index]
                month_string_ext = excel.getFileName(filePath)
                month_string = str(month_string_ext).split(".")[0]
                excel.insertmonth(workbook, new_worksheet, inital_row, month_string)
            else:
                excel.insertmonth(workbook, new_worksheet, inital_row)
            # Sheet B2B
            excel.calculator(
                workbook=workbook,
                sheet_name="B2B",
                column_map=config.B2B_COLUMN_MAP,
                check_map=config.B2B_CHECK_MAP,
                worksheet=new_worksheet,
                start_row=inital_row,
                start_col=2,
            )
            # Sheet B2B (supply Y)
            excel.calculator(
                workbook=workbook,
                sheet_name="B2B",
                column_map=config.B2B_COLUMN_MAP,
                check_map=config.B2B_SUPPLY_Y_CHECK_MAP,
                worksheet=new_worksheet,
                start_row=inital_row,
                start_col=7,
            )

            # Sheet CDNR
            # CDNR Debit
            excel.calculator(
                workbook=workbook,
                sheet_name="CDNR",
                column_map=config.CDNR_DEBIT_COLUMN_MAP,
                check_map=config.CDNR_DEBIT_CHECK_MAP,
                worksheet=new_worksheet,
                start_row=inital_row,
                start_col=12,
            )
            # CDNR Credit
            excel.calculator(
                workbook=workbook,
                sheet_name="CDNR",
                column_map=config.CDNR_CREDIT_COLUMN_MAP,
                check_map=config.CDNR_CREDIT_CHECK_MAP,
                worksheet=new_worksheet,
                start_row=inital_row,
                start_col=17,
            )
            inital_row += 1
        output = os.path.join(outputDestination, outputFileName + ".xlsx")
        new_workbook.save(output)
    except Exception as error:
        print(error)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Process Excel files to calculate GST data."
    )
    parser.add_argument(
        "input_folder",
        type=str,
        help="Path to the folder containing input Excel files.",
    )
    parser.add_argument(
        "output_folder",
        type=str,
        help="Path to the folder where the output file will be saved.",
    )
    parser.add_argument(
        "output_filename",
        type=str,
        help="Name of the output Excel file (without extension).",
    )

    args = parser.parse_args()

    input_folder = args.input_folder
    output_folder = args.output_folder
    output_filename = args.output_filename

    input_paths = get_folder_input_paths(input_folder)
    runCalculator(input_paths, output_folder, output_filename)