<template>
    <div>
        <main class="max-w-[1020px] mx-auto">
            <section class="p-10">
                <h1 class="font-bold text-4xl text-center">
                    DR Tracking Utility
                </h1>
                <p class="text-center" style="font-style: italic;">
                    Prototype
                </p>
                <div class="mt-5">
                    <client-only placeholder="loading...">
                        <QuillEditor ref="editor" :options="options"/>
                    </client-only>
                </div>
                <div class="p-4 mt-5">
                    <div class="flex items-center mb-4">
                        <h4 class="font-poppins text-3xl font-semibold me-3">
                            Configuración
                        </h4>
                        <UBadge color="primary" variant="soft" class="ms-auto text-md my-auto">
                            {{ main_file }}
                        </UBadge>
                    </div>
                    <div class="pb-5 mb-3 border-b border-gray-700">
                        <USelect v-model="selected_status" 
                        :options="status_options" class="max-w-[180px]" />
                        <UInput class="mt-5" :value="subject_line_status" color="primary" variant="outline" placeholder="Search..." />
                    </div>
                    <h4 class="text-lg font-bold mb-1">Añadir al correo</h4>
                    <UCheckbox v-model="check_highlighted_changes" name="notifications" label="Please see the attached spreadsheet..." />
                </div>
                <FileInput file_input_id="import_file" class="mt-4" @process_file="process_file"/>
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

const check_highlighted_changes = ref(true);
const main_file = ref('');

const status_options = ['Status', 'Updates', 'Additional Sites']
const selected_status = ref(status_options[0]);

const subject_line_status = computed(() => {
    let status = {
        Status: `NCS ***${main_file.value}*** Status Report`,
        Updates: `NCS ***${main_file.value}*** Update Status Report`,
        'Additional Sites': `NCS ***${main_file.value}*** Additional Sites Status Report`,
    }
    return status[selected_status.value];
});


const process_file = async (file) => {
    const { project_name, excel_data, files } = await useProject(file); // the file will be fully proced
    const { target_editor } = useEditor(editor.value, files, check_highlighted_changes.value);
    
    main_file.value = project_name.value;
}

</script>