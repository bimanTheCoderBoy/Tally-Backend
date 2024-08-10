import React, { useState } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { closeBrackets } from '@codemirror/autocomplete';

function CodingPlayground() {


  const boilerplateCode = (lang) => {
    switch (lang) {
      case 'java':
        return `class TempCode {
    // write your code here . . .
}`;
      case 'cpp':
        return `class TempCode {
  // write your code here . . .
};`;
      default:
        return '';
    }
  };

  const runCode = () => {
    // console.log(code);
    // const codepost=`${code}`;
    const codepost = convertJavaToJSString(code);

    console.log(codepost);
    axios.post('http://localhost:3010/api/v1/compiler/execute', { language, code: codepost, input })
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
    setCode(boilerplateCode(selectedLanguage)); // Reset boilerplate code on language change
  };

  const getLanguageExtension = (lang) => {
    switch (lang) {
      case 'c':
        return cpp();
      case 'cpp':
        return cpp();
      case 'java':
        return java();
      default:
        return java(); // Default to java if no match
    }
  };

  const javaKeywords = [
    // Java Keywords
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
    'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
    'interface', 'long', 'native', 'new', 'null', 'package', 'private', 'protected',
    'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
    'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while',
    'true', 'false',

    // Java Built-in Classes
    'String', 'StringBuilder', 'StringBuffer', 'Object', 'Class', 'System', 'Runtime', 'Thread',
    'Throwable', 'Exception', 'RuntimeException', 'Error', 'Integer', 'Long', 'Short', 'Byte',
    'Float', 'Double', 'Character', 'Boolean', 'Math', 'Enum', 'Void', 'Process', 'ThreadGroup',
    'Package', 'SecurityManager', 'StackTraceElement', 'Throwable', 'Exception', 'RuntimeException',

    // Java.util Classes
    'ArrayList', 'LinkedList', 'HashMap', 'HashSet', 'TreeMap', 'TreeSet', 'Hashtable', 'Vector',
    'Stack', 'Queue', 'Deque', 'PriorityQueue', 'Arrays', 'Collections', 'Calendar', 'Date',
    'TimeZone', 'UUID', 'Optional', 'Scanner', 'Random',

    // Java.io Classes
    'File', 'InputStream', 'OutputStream', 'FileInputStream', 'FileOutputStream', 'BufferedReader',
    'BufferedWriter', 'PrintWriter', 'ObjectInputStream', 'ObjectOutputStream', 'Serializable',
    'Reader', 'Writer', 'FileReader', 'FileWriter', 'PrintStream', 'FileDescriptor',

    // Java.nio Classes
    'ByteBuffer', 'CharBuffer', 'IntBuffer', 'ShortBuffer', 'LongBuffer', 'MappedByteBuffer',
    'FileChannel', 'Path', 'Paths', 'Files',

    // Java.net Classes
    'URL', 'URI', 'InetAddress', 'Socket', 'ServerSocket', 'HttpURLConnection',

    // Java.sql Classes
    'DriverManager', 'Connection', 'Statement', 'PreparedStatement', 'ResultSet', 'SQLException',
    'Date', 'Time', 'Timestamp',

    // Java.time Classes
    'LocalDate', 'LocalTime', 'LocalDateTime', 'ZonedDateTime', 'Duration', 'Period', 'Instant',
    'ZoneId', 'OffsetDateTime', 'Year', 'Month', 'DayOfWeek',

    // Java Built-in Interfaces
    'Runnable', 'Comparable', 'CharSequence', 'Cloneable', 'AutoCloseable', 'List', 'Set', 'Map',
    'Queue', 'Deque', 'Iterator', 'Collection', 'Comparator', 'Enumeration', 'Closeable',
    'DataInput', 'DataOutput', 'Flushable', 'Readable', 'Serializable', 'ReadableByteChannel',
    'WritableByteChannel', 'Key', 'PrivateKey', 'PublicKey', 'Principal', 'Temporal',
    'TemporalAccessor', 'TemporalAdjuster', 'TemporalAmount', 'Chronology', 'ChronoLocalDate',
    'ChronoLocalDateTime',

    // Notable Annotations
    'Override', 'Deprecated', 'SuppressWarnings', 'FunctionalInterface', 'SafeVarargs', 'Retention',
    'Target', 'Inherited', 'Documented'
  ];



  const customCompletions = completeFromList(
    javaKeywords.map(javaKeywords => ({ label: javaKeywords }))
  );


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
          {/* <CodeMirror
            value={code}
            height="100%"
            extensions={[getLanguageExtension(language)]}
            theme={oneDark}
            onChange={(value) => setCode(value)}
            className="h-full"
          /> */}
          <CodeMirror
            value={`class TempCode {}`}
            height="100%"
            extensions={[
              getLanguageExtension(language),
              autocompletion({ override: [customCompletions] }), // Add autocompletion
              closeBrackets()   // Optional: Automatically close brackets and quotes
            ]}
            theme={oneDark}
            onChange={(value) => setCode(`class TempCode {${value}}`)}
            // onChange={handleEditorChange}
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


