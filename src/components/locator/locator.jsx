import React, { useState, useRef } from 'react'
import {
  AxiosProvider,
  Request,
  Get,
  Delete,
  Head,
  Post,
  Put,
  Patch,
  withAxios
} from 'react-axios'

import View from './view'

import axios from 'axios'

let base_domain = ''
if (!window.location.href.startsWith('http://localhost'))
  base_domain = '/eliura'

const Locator = (props) => {
  const websiteInput = useRef()
  const htmlResult = useRef()
  const uploadFileInput = useRef()
  const repetitionNumberInput = useRef()
  const courseTimeInput = useRef()

  const [website, setWebsite] = useState('')
  const [configFile, setConfigFile] = useState({})
  const [isUploaded, setIsUploaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingList, setProcessingList] = useState([])
  const [viewResult, setViewResult] = useState(null)

  const uploadFile = (event) => {
    const fileList = event.target.files
    const file = fileList[0]
    if (file) {
      var reader = new FileReader()
      reader.readAsText(file, 'UTF-8')
      reader.onload = function (evt) {
        var elementsObj = JSON.parse(evt.target.result)
        var resultObj = {
          ...elementsObj,
          results: [],
          filename: file.name
        }
        setConfigFile(resultObj)
        setIsUploaded(true)
      }
      reader.onerror = function (evt) {
        console.log('onerror', evt.target.result)
        setIsUploaded(false)
        setConfigFile({})
      }
    } else {
      setIsUploaded(false)
      setConfigFile({})
    }
  }

  return (
    <React.Fragment>
      {viewResult === null ? (
        <React.Fragment>
          <h1>Eliura Tester</h1>
          <div className={'uploadfile-section'}>
            <h2>Upload Json File to Test</h2>
            <div className={'uploadfile-section_item'}>
              <label>1. Upload Eliura JSON</label>
              <input
                type={'file'}
                accept={'.json'}
                id={'upload_json_file'}
                ref={uploadFileInput}
                onChange={(event) => uploadFile(event)}
              />
            </div>
            <div className={'uploadfile-section_item'}>
              <label>2. Course Time</label>
              <select ref={courseTimeInput}>
                <option selected value="0.01666667">
                  Every 1 minute
                </option>
                <option value="0.25">Every 15 minute</option>
                <option value="0.5">Every 30 minute</option>
                <option value="1">Every 1 Hour</option>
                <option value="2">Every 2 Hour</option>
                <option value="3">Every 3 Hour</option>
                <option value="6">Every 6 Hour</option>
                <option value="24">Every 1 Day</option>
              </select>
            </div>
            <div className={'uploadfile-section_item'}>
              <label>3. Number of Repetitions</label>
              <input
                type={'number'}
                defaultValue={1}
                ref={repetitionNumberInput}
              />
            </div>
            <div style={{ display: 'inline-block', width: '100%' }}>
              <button
                disabled={isProcessing || !isUploaded ? true : false}
                onClick={() => {
                  setIsProcessing(true)
                  let isNew = true
                  processingList.forEach((element) => {
                    if (element.filename === configFile.filename) {
                      isNew = false
                    }
                  })

                  if (isNew) {
                    setProcessingList([
                      ...processingList,
                      { filename: configFile.filename }
                    ])
                    axios
                      .post(`${base_domain}/test`, {
                        ...configFile,
                        courseTime: courseTimeInput.current.value,
                        repetitionNumber: repetitionNumberInput.current.value
                      })
                      .then(function (response) {
                        if (response.data) {
                          setConfigFile({})
                          uploadFileInput.current.value = ''
                        }

                        setIsProcessing(false)
                      })
                      .catch(function (error) {
                        console.log(error)
                        setIsProcessing(false)
                      })
                  } else {
                    setIsProcessing(false)
                  }
                }}
              >
                {!isProcessing ? 'Start To Test' : 'Sending Information...'}
              </button>
            </div>
            {processingList.length > 0 && (
              <React.Fragment>
                <hr />
                <h3>Testing Web Pages</h3>
                <div>
                  <ol>
                    {processingList.map((element) => {
                      return <li>{element.filename}</li>
                    })}
                  </ol>
                </div>
              </React.Fragment>
            )}
          </div>

          <div className={'results-section'}>
            <h2>List of Previous Results</h2>

            <Get url={`${base_domain}/GetFileList`} params={{ website }}>
              {(error, response, isLoading, makeRequest, axios) => {
                if (error) {
                  return (
                    <div className={'result-list_error'}>
                      Something bad happened: {error.message}{' '}
                      <button
                        onClick={() =>
                          makeRequest({ params: { reload: true } })
                        }
                      >
                        Retry
                      </button>
                    </div>
                  )
                } else if (isLoading) {
                  return <div>Loading...</div>
                } else if (response !== null) {
                  return (
                    <div className={'results-section_list'}>
                      <ol>
                        {response.data.map((element) => {
                          return (
                            <li>
                              {element}
                              <a
                                href={`${base_domain}/GetFile?filename=${element}`}
                              >
                                Download
                              </a>
                              <button
                                onClick={() => {
                                  setViewResult(element)
                                }}
                              >
                                View
                              </button>
                            </li>
                          )
                        })}
                      </ol>
                      <button
                        onClick={() =>
                          makeRequest({ params: { refresh: true } })
                        }
                      >
                        Refresh
                      </button>
                    </div>
                  )
                }
                return <div>Default message before request is made.</div>
              }}
            </Get>
          </div>
        </React.Fragment>
      ) : (
        <View
          fileName={viewResult}
          baseDomain={base_domain}
          closeView={() => setViewResult(null)}
        />
      )}
    </React.Fragment>
  )
}

export default Locator
