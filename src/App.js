import logo from './logo.svg';
import Form from 'react-bootstrap/Form';
import { useState, React} from 'react';
import { distinctiveFeatures } from './distinctiveFeatures.js'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Alert from 'react-bootstrap/Alert';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const features = [
  "syllabic",
  "sonorant",
  "consonantal",
  "continuant",
  "nasal",
  "anterior",
  "coronal",
  "lateral",
  "voice",
]

const stringSplitter = /\,|\.|\/|\|/;

function App() {
  const [segmentSetA, setSegmentSetA] = useState([]);
  const [segmentSetB, setSegmentSetB] = useState([]);
  const [naturalClasses, setNaturalClasses] = useState({});
  function handleSetChange(setInputText, setID) {
    // disregard empty strings or segments not accounted for
    let validSegments = [];
    for (let segment of setInputText.split(stringSplitter).map(s => s.trim())) {
      if (segment && segment in distinctiveFeatures) {
        validSegments.push(segment);
      }
    }
    if (setID == "A") {
      setSegmentSetA(validSegments)
    } else if (setID == "B") {
      setSegmentSetB(validSegments)
    }
  }
  function handleClassChange(selected, feature, value) {
    let updateObj = Object.assign({}, naturalClasses);
    if (!selected) {
      delete updateObj[feature];
    } else {
      updateObj[feature] = value;
    }
    setNaturalClasses(updateObj);
  }
  return (
    <div className="App">
      <Container className="app-content">
      <Row>
        <h1>Distinctive features</h1>
        <Tabs
          defaultActiveKey="features"
          className="mb-3"
        >
          <Tab eventKey="features" title="natural classes">
            <NaturalClassDisplayer classFeatures={naturalClasses}/>
            <div>
              <p>Create natural classes by selecting distinctive features below:</p>
            </div>
            {features.map(f => <NaturalClassSelector feature={f} key={f} changeHandler={handleClassChange}/>)}
          </Tab>
          <Tab eventKey="segments" title="features of segments">
          <DifferenceDisplayer setA={segmentSetA} setB={segmentSetB}/>
          <Container>
            <Row>
              <Col xs={12} md={6}>
                <div className="set-form">
                  <SegmentSelector setID="A" changeHandler={handleSetChange} selectedSegments={segmentSetA}/>
                  <SegmentDisplayer segments={segmentSetA}/>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <div className="set-form">
                  <SegmentSelector setID="B" changeHandler={handleSetChange} selectedSegments={segmentSetB}/>
                  <SegmentDisplayer segments={segmentSetB}/>
                </div>
              </Col>
            </Row>
          </Container>
          </Tab>
        </Tabs>
      </Row>
      </Container>
    </div>
  );
}

function NaturalClassSelector( { feature, changeHandler } ) {
  const [selected, setSelected] = useState(false);
  const [selectedFeatureValue, setSelectedFeatureValue] = useState("+");
  return (
    <Form>
      <Form.Group>
        <Form.Check
          inline
          type="switch"
          label={feature}
          onChange={() => {
            setSelected(!selected);
            changeHandler(!selected, feature, selectedFeatureValue);
          }}
          className="feature-check"
        />
        <Form.Check
          inline
          type="radio"
          disabled={!selected}
          checked={selectedFeatureValue == "+"}
          onChange={() => {
            setSelectedFeatureValue("+");
            changeHandler(selected, feature, "+");
          }}
          label="+"
        />
        <Form.Check
          inline
          type="radio"
          disabled={!selected}
          checked={selectedFeatureValue == "-"}
          onChange={() => {
            setSelectedFeatureValue("-");
            changeHandler(selected, feature, "-");
          }}
          label="-"
        />
      </Form.Group>
    </Form>
  )
}

function NaturalClassDisplayer( { classFeatures } ) {
  if (Object.keys(classFeatures).length == 0) {
    return (
      <Alert variant="light">
        <i>segments will appear once features have been selected</i>
      </Alert>
    )
  }
  let segmentsToDisplay = [];
  for (let segment of Object.keys(distinctiveFeatures)) {
    let segmentQualifies = true;
    for (let feature of Object.keys(classFeatures)) {
      if (distinctiveFeatures[segment][feature] != classFeatures[feature]) {
        segmentQualifies = false;
      }
    }
    if (segmentQualifies) {
      segmentsToDisplay.push(segment);
    }
  }
  if (segmentsToDisplay.length == 0) {
    return (
      <Alert variant="warning">
        No segments share all the features selected
      </Alert>
    )
  }
  return (
    <Alert variant="secondary">
      {segmentsToDisplay.join(", ")}
    </Alert>
  )
}

function checkForInvalidSegments(segments) {
  if (! segments) {
    return [false, []]
  }
  let invalidSegments = [];
  for (let segment of segments) {
    if (segment != "" && (! (segment in distinctiveFeatures))) {
      invalidSegments.push(segment);
    }
  }
  if (invalidSegments.length == 0) {
    return [false, []]
  }
  return [true, invalidSegments]
}

function SegmentSelector( { setID, changeHandler, selectedSegments }) {
  const [containsInvalidSegments, setContainsInvalidSegments] = useState(false);
  const [invalidSegments, setInvalidSegments] = useState([]);
  return (
    <Form>
      <Form.Group>
        <Form.Label>Set {setID}</Form.Label>
        <Form.Control
          type="text"
          size="lg"
          placeholder="e.g. m, n, ŋ"
          onChange={e => {
            changeHandler(e.target.value, setID);
            const [contains, s] = checkForInvalidSegments(e.target.value.split(stringSplitter).map(s => s.trim()));
            setContainsInvalidSegments(contains);
            setInvalidSegments(s);
          }}
          />
        {
          selectedSegments.length == 0 &&
          <Form.Text>
            Enter IPA segments separated by punctuation
          </Form.Text>
        }
        {
          containsInvalidSegments &&
          <Form.Text>
          The following segment(s) are not recognised:
          {invalidSegments.join(", ")}
          </Form.Text>
        }
      </Form.Group>
    </Form>
  )
}

function getCommonFeatures(segments) {
  let commonFeatureValues = {};
  for (let feature of features) {
    const values = new Set();
    for (let segment of segments) {
      values.add(distinctiveFeatures[segment][feature])
    }
    if (values.size == 1) {
      commonFeatureValues[feature] = values.values().next().value;
    }
  }
  return commonFeatureValues;
}

function SegmentDisplayer( { segments }) {
  if (segments.length == 0) {
    return
  }
  const commonFeatureValues = getCommonFeatures(segments);
  if (Object.keys(commonFeatureValues).length == 0) {
    return (
      <div>
        These segments have no features in common!
      </div>
    )
  }
  return (
    <div>
      Common features include:
      <ul>
      {
        Object.keys(commonFeatureValues).map(k => <li key={k}>{commonFeatureValues[k] + k}</li>)
      }
      </ul>
    </div>
  )
}

function DifferenceDisplayer( { setA, setB }) {
  if (setA.length == 0 && setB.length == 0) {
    return
  }
  if (setA.length > 0 && setB.length > 0) {
    const commonFeatureValuesA = getCommonFeatures(setA);
    const commonFeatureValuesB = getCommonFeatures(setB);
    if (Object.keys(commonFeatureValuesA).length > 0 && Object.keys(commonFeatureValuesA).length > 0) {
      let differences = [];
      let uniques = [];
      for (let feature of Object.keys(commonFeatureValuesA)) {
        if (feature in commonFeatureValuesB && commonFeatureValuesB[feature] != commonFeatureValuesA[feature]) {
          differences.push(feature);
        }
        if (!(feature in commonFeatureValuesB)) {
          uniques.push({"feature" : feature, "value" : commonFeatureValuesA[feature]});
        }
      }
      if (differences.length > 0) {
        return (
          <div>
            Features distinguishing set A from set B:
            <ul>
              {differences.map(d => <li key={d}>{d}</li>)}
            </ul>
          </div>
        )
      }
      if (uniques.length > 0) {
        // count how important each unique is
        let featureExclusions = {};
        for (let feature of uniques) {
          // count how many segments in B that this feature of A rules out
          let exclusions = [];
          for (let segment of setB) {
            if (distinctiveFeatures[segment][feature["feature"]] != feature["value"]) {
              exclusions.push(segment);
            }
          }
          featureExclusions[feature["feature"]] = exclusions.slice();
        }
        return (
          <div>
            Common features of A that are not common to B:
            <ul>
              {uniques.map(x => {
                return (
                  <li key={x["feature"]}>
                    {x["value"] + x["feature"] + " (distinguishes A from " + featureExclusions[x["feature"]].length + " segment" + (featureExclusions[x["feature"]].length > 1? "s" : "") + " in B)"}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }
    }
  }
  return (
    <div>No features distinguish these two sets of segments.</div>
  )
}

export default App;
