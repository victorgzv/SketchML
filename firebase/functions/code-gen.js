const imports = "import React from 'react';"
               +"import {StyleSheet,View,Text,TouchableOpacity,TextInput,Switch,Image} from 'react-native';";

const opening_headers = "export default class GeneratedLayout extends React.Component {"
                        +"componentDidMount(){}"
                        +"componentWillUnmount(){}"
                        +"render(){"
                        +"return("
                        +"<View style={styles.container}>";

const closing_headers = "</View>"
                        +");"
                        +"}"
                        +"}";


const styles ="const styles = StyleSheet.create({"
            +"container: {"
            +"marginTop: 150,"
            +"justifyContent: 'center',"
            +"flexDirection: 'column'"
            +"},"
            +"rows: {"
            +"justifyContent: 'center',"
            +"flexDirection: 'row',"
            +"},"
            +"input: {"
            +"margin: 15,"
            +"height: 40,"
            +"flex:2,"
            +"borderColor: 'black',"
            +"borderWidth: 1,"
            +"paddingLeft:5"
            +"},"
            +"btn: {"
            +"margin: 15,"
            +"height: 40,"
            +"width:100,"
            +"backgroundColor:'#7bed9f',"
            +"justifyContent: 'center',"
            +"},"
            +"btnText: {"
            +"fontSize:16,"
            +"fontWeight:'500',"
            +"color:'black',"
            +"textAlign:'center'"
            +"},"
            +"switch:{"
            +"margin: 25,"
            +"height: 40,"
            +"flex:1,"
            +"},"
            +"img:{"
            +"width : 100,"
            +"height :100,"
            +"},"
            +"label:{"
            +"flex:1,"
            +"margin: 15"
            +"}"
            +"})";

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