import React, { useState, useRef } from 'react'
import {
  Request,
  Get,
  Delete,
  Head,
  Post,
  Put,
  Patch,
  withAxios
} from 'react-axios'

const nmt = (text) => {
  return text
    .replace(/&nbsp;?/g, ' ')
    .replace(/\n\r?/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const round = (num) => {
  return Math.floor(num * 100) / 100
}

const View = (props) => {
  const [isMini, setIsMini] = useState(false)

  return (
    <div>
      <h2>
        {props.fileName}
        <button onClick={props.closeView} style={{ marginLeft: '40px' }}>
          Close View
        </button>
        <button
          onClick={() => {
            setIsMini(!isMini)
          }}
          style={{ marginLeft: '40px' }}
        >
          {isMini ? 'Total Data' : 'Brief Data'}
        </button>
      </h2>
      <br />
      <Get url={`${props.baseDomain}/GetFile?filename=${props.fileName}`}>
        {(error, response, isLoading, makeRequest, axios) => {
          if (error) {
            return (
              <div className={'result-list_error'}>
                Something bad happened: {error.message}{' '}
                <button
                  onClick={() => makeRequest({ params: { reload: true } })}
                >
                  Retry
                </button>
              </div>
            )
          } else if (isLoading) {
            return <div>Loading...</div>
          } else if (response !== null) {
            const results = response.data.results
            let maxFoundEleLen = 0
            for (var i = 0; i < results.length; i++) {
              const length = results[i].foundElements.length
              if (length > maxFoundEleLen) {
                maxFoundEleLen = length
              }
            }

            const foundElements = []

            for (var k = 0; k < maxFoundEleLen; k++) {
              const eleAsDate = []
              if (response.data.elements[k]) {
                eleAsDate.push({
                  css: {
                    cssSelector: response.data.elements[k].cssSelector
                  },
                  dateTime: 'First Time',
                  ...response.data.elements.sort((a, b) => {
                    if (a.relxpath !== b.relxpath && a.relxpath < b.relxpath) {
                      return -1
                    }
                    if (a.relxpath === b.relxpath && a.relxpath > b.relxpath) {
                      return 1
                    }
                    return 0
                  })[k]
                })

                results.forEach((result) => {
                  if (result.foundElements.length === maxFoundEleLen) {
                    eleAsDate.push({
                      dateTime: result.dateTime,
                      ...result.foundElements.sort((a, b) => {
                        if (a.relxpath < b.relxpath) {
                          return -1
                        }
                        if (a.relxpath > b.relxpath) {
                          return 1
                        }
                        return 0
                      })[k]
                    })
                  }
                })
                foundElements.push(eleAsDate)
              }
            }

            let avgChangePerElement = 0,
              avgChangePerElementByCss = 0,
              avgChangeTotal = 0,
              avgChangeTotalByCss = 0,
              avgBroken = 0,
              avgBrokenByCss = 0

            return (
              <div className={'view-section_list'}>
                {foundElements.map((element, index) => {
                  const testCount = element.filter(
                    (f) => f.status === 'Found' && f.dateTime !== 'First Time'
                  ).length

                  let change = {
                      id: 0,
                      classes: 0,
                      tagname: 0,
                      text: 0,
                      style: 0,
                      alt: 0
                    },
                    changeByCss = {
                      id: 0,
                      classes: 0,
                      tagname: 0,
                      text: 0,
                      style: 0,
                      alt: 0
                    },
                    broken = 0,
                    brokenByCss = 0

                  const firstTimeTest = element.filter(
                    (f) => f.dateTime !== 'First Time'
                  )[0]

                  element
                    .filter((f) => f.dateTime !== 'First Time')
                    .forEach((ele) => {
                      let isOk = true
                      if (ele.status === 'Not Found') {
                        broken++
                        isOk = false
                      }
                      if (ele.css && ele.css['status'] === 'Not Found') {
                        brokenByCss++
                        isOk = false
                      }
                      if (isOk) {
                        // Id Changes
                        if (firstTimeTest.id && firstTimeTest.id !== ele.id) {
                          change.id++
                        }

                        if (
                          firstTimeTest.css &&
                          firstTimeTest.css['id'] &&
                          firstTimeTest.css['id'] !== ele.id
                        ) {
                          changeByCss.id++
                        }

                        // Classes Changes
                        if (
                          firstTimeTest.classes &&
                          firstTimeTest.classes !== ele.classes
                        ) {
                          change.classes++
                        }

                        if (
                          firstTimeTest.css &&
                          firstTimeTest.css['classes'] &&
                          firstTimeTest.css['classes'] !== ele.classes
                        ) {
                          changeByCss.classes++
                        }

                        // Tagname Changes
                        if (
                          firstTimeTest.tagname &&
                          firstTimeTest.tagname !== ele.tagname
                        ) {
                          change.tagname++
                        }

                        if (
                          firstTimeTest.css &&
                          firstTimeTest.css['tagname'] &&
                          firstTimeTest.css['tagname'] !== ele.tagname
                        ) {
                          changeByCss.tagname++
                        }

                        // Text Changes
                        if (
                          firstTimeTest.text &&
                          nmt(firstTimeTest.text) != nmt(ele.text)
                        ) {
                          change.text++
                        }

                        if (
                          firstTimeTest.css &&
                          firstTimeTest.css['text'] &&
                          firstTimeTest.css['text'] !== ele.text
                        ) {
                          changeByCss.text++
                        }

                        // Style Changes
                        if (
                          firstTimeTest.style &&
                          firstTimeTest.style !== ele.style
                        ) {
                          change.style++
                        }

                        if (
                          firstTimeTest.css &&
                          firstTimeTest.css['style'] &&
                          firstTimeTest.css['style'] !== ele.style
                        ) {
                          changeByCss.style++
                        }

                        // Alt Changes
                        if (
                          firstTimeTest.alt &&
                          firstTimeTest.alt !== ele.alt
                        ) {
                          change.alt++
                        }

                        if (
                          firstTimeTest.css &&
                          firstTimeTest.css['alt'] &&
                          firstTimeTest.css['alt'] !== ele.alt
                        ) {
                          changeByCss.alt++
                        }
                      }
                    })

                  avgBroken = avgBroken + broken / (element.length - 1)
                  avgBrokenByCss =
                    avgBrokenByCss + brokenByCss / (element.length - 1)

                  if (testCount > 0) {
                    avgChangePerElement = round(
                      ((change.id +
                        change.classes +
                        change.tagname +
                        change.text +
                        change.style +
                        change.alt) /
                        (6 * testCount)) *
                        100
                    )

                    avgChangePerElementByCss = round(
                      ((changeByCss.id +
                        changeByCss.classes +
                        changeByCss.tagname +
                        changeByCss.text +
                        changeByCss.style +
                        changeByCss.alt) /
                        (6 * testCount)) *
                        100
                    )
                  }

                  avgChangeTotal = avgChangeTotal + avgChangePerElement
                  avgChangeTotalByCss =
                    avgChangeTotalByCss + avgChangePerElementByCss

                  return (
                    <React.Fragment>
                      <p>
                        <b>
                          XPath ---> Broken:{' '}
                          {round((broken / (element.length - 1)) * 100)}% ,
                          Change (Avg): {avgChangePerElement}%
                        </b>
                      </p>
                      <p>
                        <b>
                          Css ---> Broken:{' '}
                          {round((brokenByCss / (element.length - 1)) * 100)}% ,
                          Change (Avg): {avgChangePerElementByCss}%
                        </b>
                      </p>
                      <table
                        id={`Element-${index + 1}`}
                        className={isMini ? 'isMini' : ''}
                      >
                        <thead>
                          <tr>
                            <th>Element {index + 1}</th>
                            <th>Change (%)</th>
                            {element.map((data, dataIndex) => (
                              <th>
                                {dataIndex === 0
                                  ? data.dateTime
                                  : new Date(data.dateTime).toLocaleString()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={'isRoot'}>
                            <td>XPath Status</td>
                            <td></td>
                            {element.map((data, dataIndex) => (
                              <td
                                className={
                                  dataIndex !== 0 && data.status === 'Found'
                                    ? 'status_found'
                                    : data.status === 'Not Found'
                                    ? 'status_not_found'
                                    : ''
                                }
                              >
                                <b>
                                  {dataIndex === 0 ? 'Selected' : data.status}
                                </b>
                                <br />
                                {data.relxpath}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Id
                              <br />
                              (XPath)
                            </td>
                            <td className={change.id > 0 ? 'bold' : ''}>
                              {testCount > 0
                                ? round((change.id / testCount) * 100)
                                : 0}
                              %
                            </td>
                            {element.map((data) => (
                              <td>{data.id}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              TagName
                              <br />
                              (XPath)
                            </td>
                            <td className={change.tagname > 0 ? 'bold' : ''}>
                              {testCount > 0
                                ? round((change.tagname / testCount) * 100)
                                : 0}
                              %
                            </td>
                            {element.map((data) => (
                              <td>{data.tagname}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Class
                              <br />
                              (XPath)
                            </td>
                            <td className={change.classes > 0 ? 'bold' : ''}>
                              {testCount > 0
                                ? round((change.classes / testCount) * 100)
                                : 0}
                              %
                            </td>
                            {element.map((data) => (
                              <td>{data.classes}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Style
                              <br />
                              (XPath)
                            </td>
                            <td className={change.style > 0 ? 'bold' : ''}>
                              {testCount > 0
                                ? round((change.style / testCount) * 100)
                                : 0}
                              %
                            </td>
                            {element.map((data) => (
                              <td>{data.style}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Alt
                              <br />
                              (XPath)
                            </td>
                            <td className={change.alt > 0 ? 'bold' : ''}>
                              {testCount > 0
                                ? round((change.alt / testCount) * 100)
                                : 0}
                              %
                            </td>
                            {element.map((data) => (
                              <td>{data.alt}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Text
                              <br />
                              (XPath)
                            </td>
                            <td className={change.text > 0 ? 'bold' : ''}>
                              {testCount > 0
                                ? round((change.text / testCount) * 100)
                                : 0}
                              %
                            </td>
                            {element.map((data) => (
                              <td>{data.text}</td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Rect
                              <br />
                              (XPath)
                            </td>
                            <td>--</td>
                            {element.map((data) => (
                              <td>
                                {data.rect && (
                                  <React.Fragment>
                                    Height:{data.rect.height} - Width:
                                    {data.rect.width}- X:{data.rect.x} - Y:
                                    {data.rect.y}
                                  </React.Fragment>
                                )}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td>
                              Image
                              <br />
                              (XPath)
                            </td>
                            <td></td>
                            {element.map((data, dataIndex) => (
                              <td>
                                {dataIndex === 0 || !data.png ? (
                                  'No Image'
                                ) : (
                                  <img src={data.png} />
                                )}
                              </td>
                            ))}
                          </tr>
                          {element[1].hasOwnProperty('css') && (
                            <React.Fragment>
                              <tr className={'isRoot'}>
                                <td>Css Status</td>
                                <td></td>
                                {element.map((data, dataIndex) => {
                                  return (
                                    <td
                                      className={
                                        dataIndex !== 0 &&
                                        data.css['status'] === 'Found'
                                          ? 'status_found'
                                          : data.css['status'] === 'Not Found'
                                          ? 'status_not_found'
                                          : ''
                                      }
                                    >
                                      <b>
                                        {dataIndex === 0
                                          ? 'Selected'
                                          : data.css['status']}
                                      </b>
                                      <br />
                                      {data.css['cssSelector']}
                                    </td>
                                  )
                                })}
                              </tr>
                              <tr>
                                <td>
                                  Id
                                  <br />
                                  (Css)
                                </td>
                                <td className={change.id > 0 ? 'bold' : ''}>
                                  {testCount > 0
                                    ? round((change.id / testCount) * 100)
                                    : 0}
                                  %
                                </td>
                                {element.map((data) => (
                                  <td>{data.css['id']}</td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  TagName
                                  <br />
                                  (Css)
                                </td>
                                <td
                                  className={change.tagname > 0 ? 'bold' : ''}
                                >
                                  {testCount > 0
                                    ? round((change.tagname / testCount) * 100)
                                    : 0}
                                  %
                                </td>
                                {element.map((data) => (
                                  <td>{data.css['tagname']}</td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  Class
                                  <br />
                                  (Css)
                                </td>
                                <td
                                  className={change.classes > 0 ? 'bold' : ''}
                                >
                                  {testCount > 0
                                    ? round((change.classes / testCount) * 100)
                                    : 0}
                                  %
                                </td>
                                {element.map((data) => (
                                  <td>{data.css['classes']}</td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  Style
                                  <br />
                                  (Css)
                                </td>
                                <td className={change.style > 0 ? 'bold' : ''}>
                                  {testCount > 0
                                    ? round((change.style / testCount) * 100)
                                    : 0}
                                  %
                                </td>
                                {element.map((data) => (
                                  <td>{data.css['style']}</td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  Alt
                                  <br />
                                  (Css)
                                </td>
                                <td className={change.alt > 0 ? 'bold' : ''}>
                                  {testCount > 0
                                    ? round((change.alt / testCount) * 100)
                                    : 0}
                                  %
                                </td>
                                {element.map((data) => (
                                  <td>{data.css['alt']}</td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  Text
                                  <br />
                                  (Css)
                                </td>
                                <td className={change.text > 0 ? 'bold' : ''}>
                                  {testCount > 0
                                    ? round((change.text / testCount) * 100)
                                    : 0}
                                  %
                                </td>
                                {element.map((data) => (
                                  <td>{data.css['text']}</td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  Rect
                                  <br />
                                  (Css)
                                </td>
                                <td>--</td>
                                {element.map((data) => (
                                  <td>
                                    {data.css['rect'] && (
                                      <React.Fragment>
                                        Height:{data.css['rect'].height} -
                                        Width:
                                        {data.css['rect'].width}- X:
                                        {data.css['rect'].x} - Y:
                                        {data.css['rect'].y}
                                      </React.Fragment>
                                    )}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td>
                                  Image
                                  <br />
                                  (Css)
                                </td>
                                <td></td>
                                {element.map((data, dataIndex) => (
                                  <td>
                                    {dataIndex === 0 || !data.css['png'] ? (
                                      'No Image'
                                    ) : (
                                      <img src={data.css['png']} />
                                    )}
                                  </td>
                                ))}
                              </tr>
                            </React.Fragment>
                          )}
                        </tbody>
                      </table>
                    </React.Fragment>
                  )
                })}
                <hr />
                <b>XPath Total</b>
                <p>
                  Broken (Total Average):{' '}
                  {round((avgBroken / foundElements.length) * 100)}%
                </p>
                <p>
                  Changes (Total Average):{' '}
                  {round(avgChangeTotal / foundElements.length)}%
                </p>
                <hr />
                <b>Css Total</b>
                <p>
                  Broken (Total Average):{' '}
                  {round((avgBrokenByCss / foundElements.length) * 100)}%
                </p>
                <p>
                  Changes (Total Average):{' '}
                  {round(avgChangeTotalByCss / foundElements.length)}%
                </p>
                <button
                  onClick={() => makeRequest({ params: { refresh: true } })}
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
  )
}

export default View
