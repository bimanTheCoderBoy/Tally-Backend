import React, { useState } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

function CodingPlayground() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java'); // Default to java
  const [input, setInput] = useState(''); // New state for user input
  const [output, setOutput] = useState('');
  const [metrics, setMetrics] = useState({ time: '', memory: '' });

  const runCode = () => {
    // console.log(code);
    // const codepost=`${code}`;
    const codepost=convertJavaToJSString(code);
    
    console.log(codepost);
    axios.post('http://localhost:3010/api/v1/compiler/execute', { language, code:codepost, input })
      .then(response => {
        console.log(response);
        setOutput(response.data.output);
        setMetrics({
          time: response.data.executionTime,
          memory: response.data.memoryUsed 
        });
      })
      .catch(error => {
        setOutput('Error:  ' + error.message);
        setMetrics({ time: '', memory: '' });
      });
  };
  

  function convertJavaToJSString(javaCode) {
    // Step 1: Remove newlines and excessive whitespace
    const singleLineCode = javaCode.replace(/\s+/g, ' ').trim();
  
    // Step 2: Escape double quotes and backslashes
    const jsCompatibleString = singleLineCode
      .replace(/\\/g, '\\\\')  // Escape backslashes
      // .replace(/"/g, '\\"');   // Escape double quotes
  
    return jsCompatibleString;
  }
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
  };

  const getLanguageExtension = (lang) => {
    switch (lang) {
      case 'c':
        return cpp();
      case 'cpp':
        return cpp();
      case 'java':
        return java();
      case 'python':
        return python();
      default:
        return cpp(); // Default to C++ if no match
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Side: Code Editor */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">Code Editor</h2>

        {/* Language Selector */}
        <div className="mb-4">
          <label htmlFor="language" className="mr-2">Select Language :</label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-800 text-white p-2 rounded"
          >
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="h-5/6 bg-gray-800 rounded-lg p-2">
          <CodeMirror
            value={code}
            height="100%"
            extensions={[getLanguageExtension(language)]}
            theme={oneDark}
            onChange={(value) => setCode(value)}
            className="h-full"
          />
        </div>
      </div>

      {/* Right Side: Input, Output & Run Button */}
      <div className="w-1/2 p-4 flex flex-col">
        <button 
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mb-4 self-start"
          onClick={runCode}
        >
          Run Code
        </button>

        {/* Input Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">Input :</h2>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded w-full mb-4"
          />
        </div>

        {/* Output Section */}
        <div >
          <h2 className="text-xl font-bold mb-2 ">Output:</h2>
          <div className="bg-gray-800 p-4 rounded mb-4 overflow-x-scroll"><pre>{output}</pre></div>
        </div>

        {/* Metrics Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">Metrics:</h2>
          <p>Execution Time : &nbsp; {metrics.time}</p>
          <p>Memory Usage : &nbsp; {metrics.memory}</p>
        </div>
      </div>
    </div>
  );
}

export default CodingPlayground;