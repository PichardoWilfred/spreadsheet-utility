import { ref } from 'vue';
import {StringUtils} from 'turbocommons-ts';
import stringComparison from 'string-comparison';
export async function useEditor(editor, files, check_highlighted_changes) {

    let compareSimilarityPercent_ = stringComparison.lcs.similarity;
    console.log(compareSimilarityPercent_);
    
    const target_editor = editor.getQuill();
    let submitter_name = 'John';

    const delta_content = ref([]); //text area content
    
    function compare_strings(string_1, string_2, minimal_percentage) {
        // build the diff view and return a DOM node
        let percentage = compareSimilarityPercent_(string_2, string_1);
        // console.log(`${string_1} & ${string_2} | ${parseInt(percentage)} (${percentage})`);
        return parseInt(percentage) >= minimal_percentage * 0.01;
    }
    const raw_changed_files = files.value.filter(({was_changed}) => was_changed);
    // console.log(files.value);
    // console.log(raw_changed_files);
    
    // const essential_changes = computed(() => {
    //     return files.value.filter(({changed_as}) =>  ['standard eta', 'vendors eta', 'agents eta','eta','completed','ep_link'].includes(changed_as))
    // });

    // console.log('------ files -----');
    // console.log(files.value);
    
    let essential_changed_files = {
        eta: raw_changed_files.filter(({changed_as}) => ['standard', 'eta','vendors', 'agents'].includes(changed_as)),
        completed: raw_changed_files.filter(({changed_as}) => changed_as === 'completed'),
        ep_links: raw_changed_files.filter(({changed_as}) => changed_as === 'ep_link'),
    }
    // console.log('----------changed files----------');
    // console.log(changed_files);
    
    // inserting greetings
    Array.prototype.sample = function()  {
        return this[Math.floor(Math.random() * this.length)]
    };

    const get_valid_date = (file_) => {
        let eta_date = file_.data.eta.toLowerCase();
        let date_per_word = eta_date.split(" ");
        let date_type = 'eta';

        let keyword_found = false;
        for (const keyword of ['standard', 'vendors', 'agents']) {
            if (keyword_found) break;
            let date_per_word = eta_date.split(" ");
            for (const word of date_per_word) {
                if (compare_strings(keyword, word, 80)) {
                    date_type = keyword;
                    keyword_found = true;
                    break;
                }
            }
        }
        
        for (const keyword of ['standard', 'vendors', 'agents', 'eta']) {
            date_per_word.map((word, word_index) => {
                if (compare_strings(keyword, word, 80)) {
                    date_per_word.splice(word_index, 1);
                }
            }); 
        }
        
        return { eta_date: date_per_word, eta_type: date_type, raw_eta_date: eta_date};
    }

    const setting_regular_email_body = (files, one_file_phrase, two_files_phrase, multiple_files_phrases) => {
        let body_content_ = [];
        if (files.length === 1) {
            body_content_ = [
                { insert: `File ` }, 
                { insert: files[0].filename, attributes: {bold: true} }, 
                { insert: ` ${one_file_phrase}, \n\n`},
            ];
        } else if (files.length === 2) {
            body_content_ = [
                { insert: `Files ` }, 
                { insert: files[0].filename, attributes: {bold: true} }, 
                { insert: ` & ` }, 
                { insert: files[1].filename, attributes: {bold: true} }, 
                { insert: ` ${two_files_phrase}, \n\n`},
            ];
        } else if (files.length >= 3) {
            body_content_ = [
                {insert: `${multiple_files_phrases}: \n`},
                ...files.map(({filename}) => ({insert: ` ${filename} \n`, attributes: {bold: true}})),
                {insert: '\n'},
            ]
        }

        return {body_content_}
    }
    const setting_outside_provider_email_body = (files, common_date, one_file_phrase, two_files_phrase, multiple_files_phrases) => {
        let body_content_ = []
        let eta_type = '';

        switch (files[0].changed_as) {
            case 'vendors':
                eta_type = 'received a Vendors ';
                break;
            case 'agents':
                eta_type = 'received an Agents ';
                break;
            case 'standard':
                eta_type = 'has a Standard ';
                break;
            case 'eta':
                eta_type = '';
                break;
            default:
                break;
        }
        
        if (files.length === 1) {
            body_content_ = [
                { insert: `File ` }, 
                { insert: files[0].filename, attributes: {bold: true} }, 
                { insert: ` ${one_file_phrase} `.replace('$$', eta_type)},
                { insert: `${common_date},\n\n` }, // getting the last one 
            ];
        } else if (files.length === 2) {
            body_content_ = [
                { insert: `Files ` }, 
                { insert: files[0].filename, attributes: {bold: true} }, 
                { insert: ` & ` }, 
                { insert: files[1].filename, attributes: {bold: true} }, 
                { insert: ` ${two_files_phrase} `.replace('$$', eta_type)},
                { insert: `${common_date},\n\n` }, // getting the last one 
            ];
        } else if (files.length >= 3) {
            body_content_ = [
                { insert: `The following files received $$ETA for,`.replace('$$', eta_type)},
                { insert: `${common_date}:\n\n` }
            ]
        }
        return {body_content_}
    }

    // email body commons
    let greetings = [
        'Hello $name',
        'Hi $name',
        'Greetings $name',
        'Good morning $name',
    ].sample().replace('$name', submitter_name)

    let greetings_convey = [
        'we hope this message finds you well',
        `we trust you're doing well`,
        `we have you're having a good week`,
        `we trust this email find you well`,
        `we hope this email find you well`,
        `we hope you've been doing well`,
        `we hope this email find you in good spirit`,
    ].sample()

    let ending = [
        `Best Regards`,
        `Kind Regards`,
        `Best wishes`,
        `With appreciation`,
        `Respectfully`,
    ].sample();

    for (const type_of_change in essential_changed_files) {
        let body_content = [];
        let files_ = essential_changed_files[type_of_change];
        
        if (type_of_change === 'eta') {
            let per_dates_type_file = [];
            files_.map((file_) => { // getting the files per date & type.
                let { eta_date, eta_type, raw_eta_date } = get_valid_date(file_);
                let index_found = false;
                let date_type_file_index = -1; 
                per_dates_type_file.map((file_stored, file_stored_index) => {
                    let {type, date, files} = file_stored;
                    if (!index_found) {
                        if (type === eta_type && eta_date.join(" ") === date.join(" ")) {
                            date_type_file_index = file_stored_index;
                            index_found = true;
                        }
                    }
                });
                
                let new_date_type = date_type_file_index === -1;
                if (new_date_type) {
                    // console.log(`Adding: (${file_.filename})`);
                    per_dates_type_file.push({ type: eta_type, date: eta_date, files: [file_]})
                }else {
                    // console.log(`found index for file (${file_.filename}) ${date_type_file_index}`);
                    per_dates_type_file[date_type_file_index]["files"].push(file_) 
                }
            });
            let body_content_node = [];
            // console.log(per_dates_type_file);
            
            per_dates_type_file.map(({files, date}) => {
                let { body_content_ } = setting_outside_provider_email_body(files, date.join(" "),
                    '$$ETA for',
                    '$$ETA for',
                    'The following files received a $$ETA for,'
                );
                body_content = [...body_content, ...body_content_];
            });

            body_content_node.map((node) => {
            })
            
        } else if (type_of_change === 'completed') {
            let { body_content_ } = setting_regular_email_body(files_, 
                'was completed', // single file
                'were completed', // 2 files
                'The following files were completed', // multiple files
            )
            body_content = body_content_;

        }else if (type_of_change === 'ep_links') {
            let { body_content_ } = setting_regular_email_body(files_, 
                'has its EP Link available', // single file
                'now have their EP Link available', // 2 files
                'The following files were completed', // multiple files
            )
            body_content = body_content_;
        }

        delta_content.value = [...delta_content.value, ...body_content];
    }

    delta_content.value.unshift({ // adding the greet
        insert: `${greetings}, ${greetings_convey}, \n\n`
    });
    
    if (check_highlighted_changes) {
        delta_content.value.push({ // adding the greet
            insert: `Please see the attached spreadsheet for the most recent changes highlighted in yellow, \n\n`
        });
    }
    delta_content.value.push({ // adding the goodbyes
        insert: `${ending},\n`
    });
    
    target_editor.setContents(delta_content.value);

    return {target_editor}
}