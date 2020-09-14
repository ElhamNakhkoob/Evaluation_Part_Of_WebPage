'use strict'
var exports = {}
exports.EliuraOptions = exports.XPath = exports.Eliura = void 0

function _instanceof(left, right) {
  if (
    right != null &&
    typeof Symbol !== 'undefined' &&
    right[Symbol.hasInstance]
  ) {
    return !!right[Symbol.hasInstance](left)
  } else {
    return left instanceof right
  }
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it
  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it
      var i = 0
      var F = function F() {}
      return {
        s: F,
        n: function n() {
          if (i >= o.length) return { done: true }
          return { done: false, value: o[i++] }
        },
        e: function e(_e) {
          throw _e
        },
        f: F
      }
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    )
  }
  var normalCompletion = true,
    didErr = false,
    err
  return {
    s: function s() {
      it = o[Symbol.iterator]()
    },
    n: function n() {
      var step = it.next()
      normalCompletion = step.done
      return step
    },
    e: function e(_e2) {
      didErr = true
      err = _e2
    },
    f: function f() {
      try {
        if (!normalCompletion && it.return != null) it.return()
      } finally {
        if (didErr) throw err
      }
    }
  }
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  )
}

function _nonIterableSpread() {
  throw new TypeError(
    'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
  )
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen)
  var n = Object.prototype.toString.call(o).slice(8, -1)
  if (n === 'Object' && o.constructor) n = o.constructor.name
  if (n === 'Map' || n === 'Set') return Array.from(o)
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen)
}

function _iterableToArray(iter) {
  if (typeof Symbol !== 'undefined' && Symbol.iterator in Object(iter))
    return Array.from(iter)
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr)
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i]
  }
  return arr2
}

function _classCallCheck(instance, Constructor) {
  if (!_instanceof(instance, Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i]
    descriptor.enumerable = descriptor.enumerable || false
    descriptor.configurable = true
    if ('value' in descriptor) descriptor.writable = true
    Object.defineProperty(target, descriptor.key, descriptor)
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps)
  if (staticProps) _defineProperties(Constructor, staticProps)
  return Constructor
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    })
  } else {
    obj[key] = value
  }
  return obj
}

var Eliura = /*#__PURE__*/ (function () {
  function Eliura(options) {
    _classCallCheck(this, Eliura)

    _defineProperty(this, 'attributePriorizationList', [
      'name',
      'class',
      'title',
      'alt',
      'value'
    ])

    _defineProperty(this, 'attributeBlackList', [
      'href',
      'src',
      'onclick',
      'onload',
      'tabindex',
      'width',
      'height',
      'style',
      'size',
      'maxlength'
    ])

    if (options) {
      this.attributePriorizationList = options.attributePriorizationList
      this.attributeBlackList = options.attributeBlackList
    }
  }
  /**
   * Returns an optimized robust XPath locator string.
   *
   * @param element - The desired element.
   * @param document - The document to analyse, that contains the desired element.
   *
   * @returns - A robust xPath locator string, describing the desired element.
   */

  _createClass(Eliura, [
    {
      key: 'getRobustXPath',
      value: function getRobustXPath(element, document) {
        if (!document.body.contains(element)) {
          throw new Error('Document does not contain given element!')
        }

        var xPathList = [new XPath('//*')]

        while (xPathList.length > 0) {
          var xPath = xPathList.shift()
          var temp = []
          temp = temp.concat(this.transfConvertStar(xPath, element))
          temp = temp.concat(this.transfAddId(xPath, element))
          temp = temp.concat(this.transfAddText(xPath, element))
          temp = temp.concat(this.transfAddAttribute(xPath, element))
          temp = temp.concat(this.transfAddAttributeSet(xPath, element))
          temp = temp.concat(this.transfAddPosition(xPath, element))
          temp = temp.concat(this.transfAddLevel(xPath, element))
          temp = _toConsumableArray(new Set(temp)) // removes duplicates

          var _iterator = _createForOfIteratorHelper(temp),
            _step

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done; ) {
              var x = _step.value

              if (this.uniquelyLocate(x.getValue(), element, document)) {
                return x.getValue()
              }

              xPathList.push(x)
            }
          } catch (err) {
            _iterator.e(err)
          } finally {
            _iterator.f()
          }
        }

        throw new Error('Internal Error: xPathList.shift returns undefined')
      }
      /**
       * Returns an element in the given document located by the given xPath locator.
       *
       * @param xPath - A xPath string, describing the desired element.
       * @param document - The document to analyse, that contains the desired element.
       *
       * @returns - The first maching Element located.
       */
    },
    {
      key: 'getElementByXPath',
      value: function getElementByXPath(xPath, document) {
        return document.evaluate(
          xPath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue
      }
      /**
       * Returns, wheater an xPath describes only the given element.
       *
       * @param xPath - A xPath string, describing the desired element.
       * @param element - The desired element.
       * @param document - The document to analyse, that contains the desired element.
       *
       * @returns - True, if the xPath describes only the desired element.
       */
    },
    {
      key: 'uniquelyLocate',
      value: function uniquelyLocate(xPath, element, document) {
        var nodesSnapshot = document.evaluate(
          xPath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        )
        return (
          nodesSnapshot.snapshotLength === 1 &&
          nodesSnapshot.snapshotItem(0) === element
        )
      }
    },
    {
      key: 'transfConvertStar',
      value: function transfConvertStar(xPath, element) {
        var output = []
        var ancestor = this.getAncestor(element, xPath.getLength() - 1)

        if (xPath.startsWith('//*')) {
          output.push(
            new XPath(
              '//' + ancestor.tagName.toLowerCase() + xPath.substring(3)
            )
          )
        }

        return output
      }
    },
    {
      key: 'transfAddId',
      value: function transfAddId(xPath, element) {
        var output = []
        var ancestor = this.getAncestor(element, xPath.getLength() - 1)

        if (ancestor.id && !xPath.headHasAnyPredicates()) {
          var newXPath = new XPath(xPath.getValue())
          newXPath.addPredicateToHead("[@id='".concat(ancestor.id, "']"))
          output.push(newXPath)
        }

        return output
      }
    },
    {
      key: 'transfAddText',
      value: function transfAddText(xPath, element) {
        var output = []
        var ancestor = this.getAncestor(element, xPath.getLength() - 1)

        if (
          ancestor.textContent &&
          !xPath.headHasPositionPredicate() &&
          !xPath.headHasTextPredicate()
        ) {
          var newXPath = new XPath(xPath.getValue())
          newXPath.addPredicateToHead(
            "[contains(text(),'".concat(ancestor.textContent, "')]")
          )
          output.push(newXPath)
        }

        return output
      }
    },
    {
      key: 'transfAddAttribute',
      value: function transfAddAttribute(xPath, element) {
        var output = []
        var ancestor = this.getAncestor(element, xPath.getLength() - 1)

        if (!xPath.headHasAnyPredicates()) {
          // add priority attributes to output
          var _iterator2 = _createForOfIteratorHelper(
              this.attributePriorizationList
            ),
            _step2

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
              var priorityAttribute = _step2.value

              var _iterator4 = _createForOfIteratorHelper(ancestor.attributes),
                _step4

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done; ) {
                  var attribute = _step4.value

                  if (attribute.name === priorityAttribute) {
                    var newXPath = new XPath(xPath.getValue())
                    newXPath.addPredicateToHead(
                      '[@'
                        .concat(attribute.name, "='")
                        .concat(attribute.value, "']")
                    )
                    output.push(newXPath)
                    break
                  }
                }
              } catch (err) {
                _iterator4.e(err)
              } finally {
                _iterator4.f()
              }
            } // append all other non-blacklist attributes to output
          } catch (err) {
            _iterator2.e(err)
          } finally {
            _iterator2.f()
          }

          var _iterator3 = _createForOfIteratorHelper(ancestor.attributes),
            _step3

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
              var _attribute = _step3.value

              if (
                !this.attributeBlackList.includes(_attribute.name) &&
                !this.attributePriorizationList.includes(_attribute.name)
              ) {
                var _newXPath = new XPath(xPath.getValue())

                _newXPath.addPredicateToHead(
                  '[@'
                    .concat(_attribute.name, "='")
                    .concat(_attribute.value, "']")
                )

                output.push(_newXPath)
              }
            }
          } catch (err) {
            _iterator3.e(err)
          } finally {
            _iterator3.f()
          }
        }

        return output
      }
    },
    {
      key: 'transfAddAttributeSet',
      value: function transfAddAttributeSet(xPath, element) {
        var _this = this

        var output = []
        var ancestor = this.getAncestor(element, xPath.getLength() - 1)

        if (!xPath.headHasAnyPredicates()) {
          // add id to attributePriorizationList
          this.attributePriorizationList.unshift('id')

          var attributes = _toConsumableArray(ancestor.attributes) // remove black list attributes

          attributes = attributes.filter(function (attribute) {
            return !_this.attributeBlackList.includes(attribute.name)
          }) // generate power set

          var attributePowerSet = this.generatePowerSet(attributes) // remove sets with cardinality < 2

          attributePowerSet = attributePowerSet.filter(function (attributeSet) {
            return attributeSet.length >= 2
          }) // sort elements inside each powerset

          var _iterator5 = _createForOfIteratorHelper(attributePowerSet),
            _step5

          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done; ) {
              var attributeSet = _step5.value
              attributeSet.sort(this.elementCompareFunction.bind(this))
            } // sort attributePowerSet
          } catch (err) {
            _iterator5.e(err)
          } finally {
            _iterator5.f()
          }

          attributePowerSet.sort(function (set1, set2) {
            if (set1.length < set2.length) {
              return -1
            }

            if (set1.length > set2.length) {
              return 1
            }

            for (var i = 0; i < set1.length; i++) {
              if (set1[i] !== set2[i]) {
                return _this.elementCompareFunction(set1[i], set2[i])
              }
            }

            return 0
          }) // remove id from attributePriorizationList

          this.attributePriorizationList.shift() // convert to predicate

          var _iterator6 = _createForOfIteratorHelper(attributePowerSet),
            _step6

          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done; ) {
              var _attributeSet = _step6.value
              var predicate = '[@'
                .concat(_attributeSet[0].name, "='")
                .concat(_attributeSet[0].value, "'")

              for (var i = 1; i < _attributeSet.length; i++) {
                predicate += ' and @'
                  .concat(_attributeSet[i].name, "='")
                  .concat(_attributeSet[i].value, "'")
              }

              predicate += ']'
              var newXPath = new XPath(xPath.getValue())
              newXPath.addPredicateToHead(predicate)
              output.push(newXPath)
            }
          } catch (err) {
            _iterator6.e(err)
          } finally {
            _iterator6.f()
          }
        }

        return output
      }
    },
    {
      key: 'transfAddPosition',
      value: function transfAddPosition(xPath, element) {
        var output = []
        var ancestor = this.getAncestor(element, xPath.getLength() - 1)

        if (!xPath.headHasPositionPredicate()) {
          var position = 1

          if (xPath.startsWith('//*')) {
            position =
              Array.from(ancestor.parentNode.children).indexOf(ancestor) + 1
          } else {
            var _iterator7 = _createForOfIteratorHelper(
                ancestor.parentNode.children
              ),
              _step7

            try {
              for (_iterator7.s(); !(_step7 = _iterator7.n()).done; ) {
                var child = _step7.value

                if (ancestor === child) {
                  break
                }

                if (ancestor.tagName === child.tagName) {
                  position++
                }
              }
            } catch (err) {
              _iterator7.e(err)
            } finally {
              _iterator7.f()
            }
          }

          var newXPath = new XPath(xPath.getValue())
          newXPath.addPredicateToHead('['.concat(position, ']'))
          output.push(newXPath)
        }

        return output
      }
    },
    {
      key: 'transfAddLevel',
      value: function transfAddLevel(xPath, element) {
        var output = []

        if (xPath.getLength() - 1 < this.getAncestorCount(element)) {
          output.push(new XPath('//*' + xPath.substring(1)))
        }

        return output
      }
    },
    {
      key: 'generatePowerSet',
      value: function generatePowerSet(input) {
        return input.reduce(
          function (subsets, value) {
            return subsets.concat(
              subsets.map(function (set) {
                return [value].concat(_toConsumableArray(set))
              })
            )
          },
          [[]]
        )
      }
    },
    {
      key: 'elementCompareFunction',
      value: function elementCompareFunction(attr1, attr2) {
        var _iterator8 = _createForOfIteratorHelper(
            this.attributePriorizationList
          ),
          _step8

        try {
          for (_iterator8.s(); !(_step8 = _iterator8.n()).done; ) {
            var element = _step8.value

            if (element === attr1.name) {
              return -1
            }

            if (element === attr2.name) {
              return 1
            }
          }
        } catch (err) {
          _iterator8.e(err)
        } finally {
          _iterator8.f()
        }

        return 0
      }
    },
    {
      key: 'getAncestor',
      value: function getAncestor(element, index) {
        var output = element

        for (var i = 0; i < index; i++) {
          output = output.parentElement
        }

        return output
      }
    },
    {
      key: 'getAncestorCount',
      value: function getAncestorCount(element) {
        var count = 0

        while (element.parentElement) {
          element = element.parentElement
          count++
        }

        return count
      }
    }
  ])

  return Eliura
})()

exports.Eliura = Eliura

var XPath = /*#__PURE__*/ (function () {
  function XPath(value) {
    _classCallCheck(this, XPath)

    this.value = value
  }

  _createClass(XPath, [
    {
      key: 'getValue',
      value: function getValue() {
        return this.value
      }
    },
    {
      key: 'startsWith',
      value: function startsWith(value) {
        return this.value.startsWith(value)
      }
    },
    {
      key: 'substring',
      value: function substring(value) {
        return this.value.substring(value)
      }
    },
    {
      key: 'headHasAnyPredicates',
      value: function headHasAnyPredicates() {
        return this.value.split('/')[2].includes('[')
      }
    },
    {
      key: 'headHasPositionPredicate',
      value: function headHasPositionPredicate() {
        var splitXPath = this.value.split('/')
        var regExp = new RegExp('[[0-9]]')
        return (
          splitXPath[2].includes('position()') ||
          splitXPath[2].includes('last()') ||
          regExp.test(splitXPath[2])
        )
      }
    },
    {
      key: 'headHasTextPredicate',
      value: function headHasTextPredicate() {
        return this.value.split('/')[2].includes('text()')
      }
    },
    {
      key: 'addPredicateToHead',
      value: function addPredicateToHead(predicate) {
        var splitXPath = this.value.split('/')
        splitXPath[2] += predicate
        this.value = splitXPath.join('/')
      }
    },
    {
      key: 'getLength',
      value: function getLength() {
        var splitXPath = this.value.split('/')
        var length = 0

        var _iterator9 = _createForOfIteratorHelper(splitXPath),
          _step9

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done; ) {
            var piece = _step9.value

            if (piece) {
              length++
            }
          }
        } catch (err) {
          _iterator9.e(err)
        } finally {
          _iterator9.f()
        }

        return length
      }
    }
  ])

  return XPath
})()

exports.XPath = XPath

var EliuraOptions = function EliuraOptions() {
  _classCallCheck(this, EliuraOptions)

  _defineProperty(this, 'attributePriorizationList', [
    'name',
    'class',
    'title',
    'alt',
    'value'
  ])

  _defineProperty(this, 'attributeBlackList', [
    'href',
    'src',
    'onclick',
    'onload',
    'tabindex',
    'width',
    'height',
    'style',
    'size',
    'maxlength'
  ])
}

exports.EliuraOptions = EliuraOptions

module.exports = exports
