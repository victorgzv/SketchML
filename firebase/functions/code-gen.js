const imports = "import React from 'react';\n"
               +"import {StyleSheet,View,Text,TextInput} from 'react-native';\n";

const opening_headers = "export default class GeneratedLayout extends React.Component {\n"
                        +"componentDidMount(){}\n"
                        +"componentWillUnmount(){}\n"
                        +"render(){ \n"
                        +"return(\n"
                        +"<View style={styles.container}>\n";

const closing_headers = "</View>\n"
                        +");\n"
                        +"}\n"
                        +"}\n";


const styles ="const styles = StyleSheet.create({\n"
            +"container: {\n"
            +"marginTop: 150,\n"
            +"justifyContent: 'center',\n"
            +"flexDirection: 'column'\n"
            +"},\n"
            +"rows: {\n"
            +"justifyContent: 'center',\n"
            +"flexDirection: 'row',\n"
            +"},\n"
            +"input: {\n"
            +"margin: 15,\n"
            +"height: 40,\n"
            +"flex:2,\n"
            +"borderColor: 'black',\n"
            +"borderWidth: 1,\n"
            +"paddingLeft:5\n"
            +"},\n"
            +"label: {\n"
            +"flex:1,\n"
            +"margin: 15\n"
            +"}\n"
            +"})\n";

module.exports = {
    addImports: function() {
    return imports;
    },
    addopeningHeaders: function() {
        return opening_headers;
    },
    addclosingHeaders: function() {
        return closing_headers;
    },
    addStyles: function() {
        return styles;
    }
};