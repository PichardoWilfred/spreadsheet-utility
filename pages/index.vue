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

const process_file = async (file) => {
    const { project_name, excel_data, files } = await useProject(file); // the file will be fully proced
    const { target_editor } = useEditor(editor.value, files);
    
}


onMounted(async () => {

});


</script>