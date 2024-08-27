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
                        <QuillEditor ref="editor" :options="options"/>
                    </client-only>
                </div>
                <FileInput file_input_id="import_file" class="mt-10" @process_file="process_file"/>
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
const delta_email_content = ref([]);

// const files_ = ref([]);
// v-model:content="delta_"  @ready="quill_initialized"


const process_file = async (file) => {
    const {project_name, excel_data, files, loading_file} = await useProject(file); // the file will be fully proced
    
    delta_email_content.value = files.value.filter(({was_changed}) => was_changed).map(({filename, data, was_changed}) => {
        return { insert: `File ${filename} is in ${data.status}. \n\n` }
    });
    
    editor.value["editor"].__quill.setContents(delta_email_content.value);
}


onMounted(async () => {
    async function handleFileAsync(e) {

        const file = e.target.files[0];
        const proyect_name = file.name.split('.')[0];

        // console.log(`filename: ${proyect_name}`);
        
        const data = await file.arrayBuffer();
        
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
                });
            });
            console.log(files.value);
        });
        
    }
});


</script>