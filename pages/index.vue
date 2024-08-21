<template>
    <div>
        <main class="max-w-[1020px] mx-auto">
            <section class="p-10">
                <h1 class="font-bold text-4xl">
                    All the leaves are brown
                </h1>
                <p class="font-" style="font-style: italic;">
                    all the leaves are brown...
                </p>
                <div class="mt-5">
                    <client-only placeholder="loading...">
                        <QuillEditor ref="editor" v-model:content="delta_" :options="options" @ready="quill_initialized"/>
                    </client-only>
                </div>
                <input type="file" id="import_file">
            </section>
        </main>
    </div>
</template>
<script setup>
import exceljs from "exceljs";
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const options = {
    modules: {
        toolbar: ['bold', 'italic', 'underline']
    },
    placeholder: 'Compose an epic...',
    theme: 'snow'
}
const editor = ref(null);

const files = ref([]);
const delta_ = ref([]);

// const quill_initialized = (editor) => {
//     editor.value = editor;
//     console.log('quilljs initialized');
//     console.log(editor.value);
// }

onMounted(async () => {
    
    // XLSX is a global from the standalone script
    const file_import_input = document.querySelector("input#import_file");

    async function handleFileAsync(e) {
        const file = e.target.files[0];
        const proyect_name = file.name.split('.')[0];

        console.log(`filename: ${proyect_name}`);
        
        const data = await file.arrayBuffer();

        // const workbook = XLSX.read(data);
        // const workbook_ = XLSX.readFile(data);
        
        const workbook_utility = new exceljs.Workbook();

        function is_current_status_format(str) {
            const regex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2} (AM|PM) GMT \d{4}$/;
            return regex.test(str);
        }

        function is_ep_date_format(dateString) {
            // Regular expression to match the MM/DD/YYYY format
            const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
            return regex.test(dateString);
        }

        function is_ep_link(url) {
            const prefix = "https://ep.link.example";
            return url.startsWith(prefix);
        }

        workbook_utility.xlsx.load(data).then((excel_data) => {
            const ws = excel_data.getWorksheet('Hoja 1');
            console.log(ws);
            console.log(`------------------`);
            let probable_status = [
                'Report Completed', 
                'Examiner Workbench', 
                'In Process with Agent',
                'In process with Vendor',
                'In process with Energy',
                'In process with RTT',
                'Quality Control',
                'Extensive Energy',
                'Searching',
                'Vendor Search',
                'Vendor Support',
                'Split and Labeling',
            ].map((state) => state.toLocaleLowerCase());

            ws._rows.map((row) => {
                row["_cells"].map((cell) => {
                    
                    let row = cell["row"];
                    let address = cell["address"];
                    let value = cell.text;

                    if (value) { // has string value. 
                        let filename;
                        let status;
                        let current_status;
                        let ep_link;
                        let ep_date;
                        // console.log(`value: ${value}`);
                        
                        if (value.includes(proyect_name)) { // if it has the name of the file (is from file number).
                            files.value.push({
                                filename: value,
                                row_number: row,
                            })
                        }

                        let fg_Color = cell.style.fill.fgColor;
                        if (fg_Color) { //if there was a change 
                            let color_is_yellow = fg_Color.argb.toUpperCase() === 'FFFFFF00'; //check if the foreground color is yellow.
                            if (color_is_yellow) { // there was a change
                                
                                let index_ = files.value.findIndex(({row_number}) => row_number === row);

                                if (probable_status.includes(value.toLocaleLowerCase())) { // if it a status title registered
                                    files.value[index_]["status"] = value;
                                }
                                if (is_current_status_format(value)) { // if it matches the current status format
                                    files.value[index_]["current_status"] = value;
                                }
                                if (is_ep_link(value)) {
                                    files.value[index_]["ep_link"] = value;
                                }
                                if (is_ep_date_format(value)) {
                                    files.value[index_]["ep_date"] = value;
                                }
                            }
                        }
                    }
                    // console.log(`${address}: ${value}`);
                });
            });
            console.log(files.value);
            // console.log(editor.value);

            files.value = files.value.map(({filename, status, ep_link, ep_date}) => {
                if (status) {
                    return {insert: `File ${filename} is in ${status}. \n\n`}
                }else {
                    return {insert: ''}
                }
            });

            
            editor.value["editor"].__quill.setContents(files.value);
            // files.value.map(({filename, status, ep_link, ep_date}) => {
            //     if (status) {
            //     }
            // });
        });

        



        // for (const [key, value] of Object.entries(workbook_.Sheets["Hoja 1"])) {
        //     console.log(`${key}:`);
        //     console.log(value["h"]);
        // }
        // console.log(workbook_);
        
    }
    file_import_input.addEventListener("change", handleFileAsync, false);
});
// import Quill from 'quill';
// Or if you only need the core build
// import Quill from 'quill/core';


</script>