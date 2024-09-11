import { ref, computed } from 'vue';
import exceljs from "exceljs";
import {StringUtils} from 'turbocommons-ts';
import stringComparison from 'string-comparison';
import { useOfficeStore } from '@/store/offices';

export async function useProject(file) {
    
    let compareSimilarityPercent_ = stringComparison.lcs.similarity;
    // console.log(compareSimilarityPercent_('papo', 'papotico'));

    let office_store = useOfficeStore();
    const file_data = await file.arrayBuffer();
    const project_name = ref(file.name.split('.')[0]); 

    const file_workbook = new exceljs.Workbook();
    let excel_data;

    try {
        excel_data = await file_workbook.xlsx.load(file_data);
    } catch (error) {
        console.log(error);
    }

    const projects_worksheets = ref([]);
    const files = ref([]);
    const subject_titles = ['file number', 'status', 'current status', 'eta', 'note', 'ep link','ep date'];
    
    const get_state = (value_) => {return value_.slice(4,6)};
    const has_valid_nomenclature = (file_) => String(file_.replace(/\s/g,'')).toLowerCase().startsWith(project_name.value.toLowerCase()) 
    && office_store.states.map((state) => state.initials).includes( get_state(file_.replace(/\s/g,'')) ) && file_.length >= 8;

    function compare_strings(string_1, string_2, minimal_percentage) {
        // build the diff view and return a DOM node
        let percentage = compareSimilarityPercent_(string_2, string_1);
        // console.log(`${string_1} & ${string_2} | ${parseInt(percentage)} (${percentage})`);
        return parseInt(percentage) >= minimal_percentage * 0.01;
    }

    function valid_eta_date(dateStr) { // Regular expression pattern to match the date formats "MM-DD-YYYY", "MM/DD/YYYY", "MM-DD-YY", or "MM/DD/YY"
        const pattern = /^\d{2}[-/]\d{2}[-/]\d{2}(\d{2})?$/;
        return pattern.test(dateStr);
    }

    excel_data.worksheets.map((worksheet) => {
        let worksheet_data = {id: worksheet.id, name: worksheet.name, files: []}
        
        worksheet._rows.map((row) => {
            let is_title_row = row.values.some((value) => subject_titles.includes(String(value).toLowerCase())); // # file number, status, ETA, like cell
            let is_file_row = row.values.some((value) => has_valid_nomenclature(value) ); // 1U7VMN01 like this 

            if (is_title_row) { // when finding a row that has any of the subject_titles
                worksheet_data["subject_row"] = row;
                
                let word_found = false;
                let file_subject_cell = '';
                
                row["model"]["cells"].map(({ value, address }) => {
                    let string_to_file = value.toLowerCase().split(" "); 
                    if (!word_found) {
                        string_to_file.map((word) => {
                            if ( compare_strings(word, 'file', 50) || compare_strings(word, 'number', 50) ) {
                                file_subject_cell = address;
                                word_found = true;
                            }
                        });
                    }
                });
                let cell_values = worksheet.getCell(file_subject_cell)["_column"]["values"].filter((value) => value.length);
                let accumulated_prefixes = [];

                cell_values.map((cell_text) => {
                    let prefix = cell_text.slice(0, 4);
                    let found_index = accumulated_prefixes.findIndex((value) => value.prefix === prefix);
                    if (found_index !== -1) {
                        accumulated_prefixes[found_index].quantity = accumulated_prefixes[found_index].quantity + 1;
                    }else {
                        accumulated_prefixes.push({prefix, quantity: 1});
                    }
                });

                let index_bigger = 0;
                let bigger_quantity = 0;

                accumulated_prefixes.map(({prefix, quantity}, _index) => {
                    if (quantity >= bigger_quantity) {
                        bigger_quantity = quantity;
                        index_bigger = _index;
                    }
                });
                project_name.value = accumulated_prefixes[index_bigger].prefix; // project name
                console.log(project_name.value );
                
                let title_addresses = [];

                row["_cells"].map(({text, address, row}) => { // once we get the subject_title rows we iterate them and extract their data.
                    let cell_title = ''; // a cell that has a subject title
                    let cell_text = ''; // the cells raw text

                    text.split(" ").some((cell_word_) => { //getting all the words from the excell cell
                        let cell_word = cell_word_.toLowerCase();
                        
                        if (cell_word === 'file' || cell_word === 'number') {
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
                row["_cells"].map(({text, address, row, _row, style}) => {
                    
                    if (has_valid_nomenclature(text)) { // if it is a file cell
                        // console.log(`(${text})`);
                        const get_letter = (column_name) => // getting the letter
                        worksheet_data["title_cells"].find(({subject_title}) => subject_title === column_name);

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

                        let status_changed = status.style?.fill?.fgColor?.argb?.toUpperCase() === 'FFFFFF00';
                        let ep_link_changed = ep_link.style?.fill?.fgColor?.argb?.toUpperCase() === 'FFFFFF00';
                        let eta_changed = eta.style?.fill?.fgColor?.argb?.toUpperCase() === 'FFFFFF00';
                        
                        let changed_as = '';
                        let completed_src = status.text.toLowerCase().split(" ");
                        
                        //get a valid eta date
                        const get_valid_date = (file_) => {
                            let date_src = file_.text.toLowerCase().split(" ");
                            ['standard','eta','vendors','agents'].map((keyword) => {
                                date_src.map((word, word_index) => {
                                    if ( compare_strings(keyword, word, 80) ) {
                                        date_src.splice(word_index, 1);
                                    }
                                })
                            });
                            return date_src.join(" ");
                        }

                        if (eta_changed) { // normal | agente o vendor | standard
                            
                            let keyword_found = false;
                            for (const keyword of ['standard', 'vendors', 'agents']) {
                                if (keyword_found) break;
                                // console.log('comparing ', keyword);
                                let date_per_word = eta.text.toLowerCase().split(" ");
                                
                                changed_as = 'eta';
                                for (const word of date_per_word) {
                                    if (compare_strings(keyword, word, 80)) {
                                        changed_as = keyword;
                                        keyword_found = true;
                                        // console.log(`${keyword} matches!`);
                                        break;
                                    }
                                }
                            }
                        }

                        if (completed_src.length === 1 && completed_src[0] === 'completed') {
                            changed_as = 'completed';
                        }else if (completed_src.length === 2 && (completed_src[0] === 'report' && completed_src[1] === 'completed')) {
                            changed_as = 'completed';
                        } 
                        
                        if (ep_link_changed && ep_link.text.startsWith('https://')) { // if its on yellow & has an EP Link 
                            changed_as = 'ep_link';
                        }
                        
                        let file = {
                            address,
                            row,
                            was_changed: (status_changed || ep_link_changed || eta_changed),
                            changed_as, //will indicate wich essential change was performed on the file
                            status_changed,
                            ep_link_changed,
                            eta_changed,
                            filename: text.replace(/\s/g,''),
                            worksheet: worksheet_data,
                            column: address.split("")[0],
                            row_data: _row,
                            data: {
                                name: text.replace(/\s/g,''),
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

                            local_office_state: get_state(text.replace(/\s/g,''))
                        }

                        files.value.push({...file});
                        worksheet_data["files"].push(file);
                    }
                });
            }
        });
        projects_worksheets.value.push({ ...worksheet_data });
    });
    console.log();
    return {file_data, excel_data, project_name, files, projects_worksheets}
}