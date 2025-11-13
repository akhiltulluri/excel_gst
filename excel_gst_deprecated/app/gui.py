from PyQt5.uic import loadUi
from PyQt5.QtWidgets import QMainWindow, QFileDialog, QMessageBox
import os
import ntpath
import openpyxl
from openpyxl import Workbook
from utils import excel
import config


class MainWindow(QMainWindow):
    def __init__(self):
        super(MainWindow, self).__init__()
        gui_path = os.path.join(os.getcwd(), "excel_gst/gui.ui")
        loadUi(gui_path, self)
        self.browse_input.clicked.connect(self.browsefilesInput)
        self.browse_output.clicked.connect(self.browsefilesOutput)
        self.run.clicked.connect(self.runCalculator)
        self.output_filename_field.textChanged[str].connect(self.onFileNameChange)
        self.clearButton.clicked.connect(self.clearInputs)
        self.inputPaths = None
        self.outputDestination = None
        self.outputFileName = None

    def getFileName(self, path):
        head, tail = ntpath.split(path)
        return tail or ntpath.basename(head)

    def browsefilesInput(self):
        fnames = QFileDialog.getOpenFileNames(
            parent=self, caption="Open file", filter="Excel files(*.xlsx)"
        )
        names = fnames[0]
        filenames = [self.getFileName(name) for name in names]
        if names:
            self.filepath.setText(",".join(filenames))
            self.inputPaths = names
        self.checkInputs()

    def browsefilesOutput(self):
        output_destination = QFileDialog.getExistingDirectory(
            parent=self, caption="Select Directory"
        )
        if output_destination:
            self.output_destination.setText(output_destination)
            self.outputDestination = output_destination
        self.checkInputs()

    def onFileNameChange(self, text):
        if text == "":
            self.outputFileName = None
            self.run.setEnabled(False)
        else:
            self.outputFileName = text
        self.checkInputs()

    def clearInputs(self):
        self.inputPaths = None
        self.outputDestination = None
        self.filepath.setText("")
        self.output_destination.setText("")
        self.output_filename_field.setText("")
        self.run.setEnabled(False)

    def success_popup(self):
        msg = QMessageBox()
        msg.setWindowTitle("Success")
        msg.setText("Successfully calculated!")
        msg.setIcon(QMessageBox.Information)

        _ = msg.exec_()

    def error_popup(self):
        msg = QMessageBox()
        msg.setWindowTitle("Failed")
        msg.setText("Failed Calculation! Please contact Akhil")
        msg.setIcon(QMessageBox.Critical)

        _ = msg.exec_()

    def checkInputs(self):
        if (
            (self.inputPaths != None)
            & (self.outputDestination != None)
            & (self.outputFileName != None)
        ):
            self.run.setEnabled(True)
        else:
            self.run.setEnabled(False)

    def runCalculator(self):
        try:
            workbooks = [
                openpyxl.load_workbook(inputPath) for inputPath in self.inputPaths
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
                    filePath = self.inputPaths[workbook_index]
                    month_string_ext = self.getFileName(filePath)
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

                # Sheet CDNR
                # CDNR Debit
                excel.calculator(
                    workbook=workbook,
                    sheet_name="CDNR",
                    column_map=config.CDNR_DEBIT_COLUMN_MAP,
                    check_map=config.CDNR_DEBIT_CHECK_MAP,
                    worksheet=new_worksheet,
                    start_row=inital_row,
                    start_col=7,
                )
                # CDNR Credit
                excel.calculator(
                    workbook=workbook,
                    sheet_name="CDNR",
                    column_map=config.CDNR_CREDIT_COLUMN_MAP,
                    check_map=config.CDNR_CREDIT_CHECK_MAP,
                    worksheet=new_worksheet,
                    start_row=inital_row,
                    start_col=12,
                )
                inital_row += 1
            output = os.path.join(self.outputDestination, self.outputFileName + ".xlsx")
            new_workbook.save(output)
            self.success_popup()
        except Exception as error:
            print(error)
            self.error_popup()
