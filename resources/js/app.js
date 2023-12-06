// app entrypoint
import Swup from "swup";
import SwupHeadPlugin from '@swup/head-plugin';
import SwupFormsPlugin from '@swup/forms-plugin';
const swup = new Swup({
    plugins: [
        new SwupHeadPlugin(),
        new SwupFormsPlugin()
    ]
});
