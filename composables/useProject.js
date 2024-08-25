import { ref } from 'vue';
import exceljs from "exceljs";
import { useOfficeStore } from '@/store/offices';

export async function useProject(file) {
    let office_store = useOfficeStore();

    const file_data = await file.arrayBuffer();
    const project_name = ref(file.name.split('.')[0]);
    
    const file_workbook = new exceljs.Workbook();
    const excel_data = await file_workbook.xlsx.load(file_data);

    const projects_worksheets = ref([]);
    const files = ref([]);
    const subject_titles = ['file number', 'status', 'current status', 'eta', 'note', 'ep link','ep date'];
    
    const get_state = (value_) => {return value_.slice(4,6)};
    const has_valid_nomenclature = (file_) => String(file_).toLowerCase().startsWith(project_name.value.toLowerCase()) && office_store.states.map((state) => state.initials).includes( get_state(file_) ) ;

    excel_data.worksheets.map((worksheet) => {
        let worksheet_data = {id: worksheet.id, name: worksheet.name, files: []}
        
        worksheet._rows.map((row) => {

            let is_title_row = row.values.some((value) => subject_titles.includes(String(value).toLowerCase())); // # file number, status, ETA, like cell
            let is_file_row = row.values.some((value) => has_valid_nomenclature(value) ); // 1U7VMN01 like this 

            if (is_title_row) { // when finding a row that has any of the subject_titles
                worksheet_data["subject_row"] = row;
                let title_addresses = [];

                row["_cells"].map(({text, address, row}) => { // once we get the subject_title rows we iterate them and extract their data.
                    let cell_title = ''; // a cell that has a subject title
                    let cell_text = ''; // the cells raw text

                    text.split(" ").some((cell_word_) => { //getting all the words from the excell cell
                        let cell_word = cell_word_.toLowerCase();
                        
                        if (cell_word === 'file') {
                            cell_title = '# File Number';
                            cell_text = text;
                            return true;
                        } else if (cell_word === 'status') {
                            cell_title = 'Status';
                            cell_text = text;
                            return true;
                        }else if (cell_word === 'time' || cell_word === 'current') {
                            cell_title = 'Current Status / Time Date';
                            cell_text = text;
                            return true;
                        }else if (cell_word === 'eta' ) {
                            cell_title = 'ETA';
                            cell_text = text;
                            return true;
                        }else if (cell_word === 'note' || cell_word === 'notes') {
                            cell_title = 'Notes';
                            cell_text = text;
                            return true;
                        }else if (cell_word === 'link') {
                            cell_title = 'EP Link';
                            cell_text = text;
                            return true;
                        }else if (cell_word === 'date') {
                            cell_title = 'EP Date';
                            cell_text = text;
                            return true;
                        }
                    });

                    if (cell_title.length) {
                        title_addresses.push({ subject_title: cell_title, cell_text, address, row, column: address.split("")[0] });
                    }
                });

                worksheet_data["title_cells"] = title_addresses;
            }

            if (is_file_row) { // when the row has a file within
                row["_cells"].map(({text, address, row, _row}) => {
                    if (has_valid_nomenclature(text)) { // if it is a file cell
                        // getting the letter
                        const get_letter = (column_name) => worksheet_data["title_cells"].find(({subject_title}) => subject_title === column_name); 
                        let { column: file_letter } = get_letter('# File Number');
                        let { column: status_letter } = get_letter('Status'); // getting the letter of the status for this file
                        let { column: date_letter } = get_letter('Current Status / Time Date');
                        let { column: eta_letter } = get_letter('ETA');
                        let { column: notes_letter } = get_letter('Notes');
                        let { column: ep_link_letter } = get_letter('EP Link');
                        let { column: ep_date_letter } = get_letter('EP Date');

                        let status = _row.getCell(status_letter);
                        let time_date = _row.getCell(date_letter);

                        let eta = _row.getCell(eta_letter);
                        let notes = _row.getCell(notes_letter);

                        let ep_link = _row.getCell(ep_link_letter);
                        let ep_date = _row.getCell(ep_date_letter);
                        
                        let file = { 
                            filename: text,
                            address, 
                            row,
                            worksheet: worksheet_data, 
                            column: address.split("")[0], 
                            row_data: _row,
                            data: {
                                name: text,
                                status: status.text,
                                time_date: time_date.text,

                                eta: eta.text,
                                notes: notes.text,

                                ep_link: ep_link.text,
                                ep_date: ep_date.text,

                                has_ep_link: (ep_link.text.length ? true : false)
                            },
                            status_address: status.address, //status (address)
                            time_date_address: time_date.address, // time/date (address)
                            
                            eta_address: eta.address,
                            notes_address: notes.address,

                            ep_link_address: ep_link.address,
                            ep_date_address: ep_date.address,
                        }

                        files.value.push({...file});
                        worksheet_data["files"].push(file);
                    }
                });
            }
        });
        projects_worksheets.value.push({ ...worksheet_data });
    });

    console.log(projects_worksheets.value);
    console.log(files.value);
    

    return {file_data, excel_data, project_name, files, projects_worksheets}
}