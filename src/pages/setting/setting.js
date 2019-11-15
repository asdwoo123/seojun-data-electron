import React, {Component} from 'react';

class Setting extends Component {
    dropFile = (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        console.log(files)
    };

    render() {
        return (
            <div onDrop={this.dropFile} className="flex center dropBox">
                <h1>Put your configuration file here</h1>
            </div>
        )
    }
};

export default Setting;
