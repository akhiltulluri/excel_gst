# GST Excel file manipulator

A python GUI for generating consolidated report from month-wise details of input tax credit, credit notes and debit notes.

I built this project long ago to help my dad with his work at office -- saving him time by automating 2 days of manual work to be done within seconds.

<img width="1390" alt="image" src="https://user-images.githubusercontent.com/43880032/232292264-89e50fb1-8fbd-4c35-92ba-24e67e192f9b.png">

## Setup Instructions

```
# create a venv
python3 -m venv venv
source venv/bin/activate
# install deps
pip install -r requirements.txt

# run
python cli.py <input_folder> <output_folder> <output_file_name>
```

### DEPRECATED: This Program USED to have a GUI, and since pyqt5 doesn't work on ARM Macbooks and I don't have time to port to pyqt6

Make sure you've Python and [poetry](https://python-poetry.org/docs/) installed.

Install the dependencies

```cmd
poetry install
```

Run the GUI

```cmd
poetry run python excel_gst/main.py
```
