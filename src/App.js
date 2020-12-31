import React, { useState, useEffect, useRef } from "react";

import { Input, Typography, Collapse } from "antd";

import useDebounce from "./useDebounce.js";
import data from "./data.json";

import "antd/dist/antd.css";
import "./App.css";

const groupByTypeFunc = (items) => {
  // object for storing the reference index
  var ref = {};
  // iterate over array and generate result object
  var res = items.reduce(function (arr, o) {
    // check index defined in `ref`
    if (ref.hasOwnProperty(o["MÃ LOẠI"]))
      // if defined then push value to that index
      arr[ref[o["MÃ LOẠI"]]].push(o);
    // else add index and push new array as element
    else {
      ref[o["MÃ LOẠI"]] = arr.length;
      arr.push([o]);
    }
    // return the array reference
    return arr;
    // set initial value as empty array
  }, []);
  let final = [];

  res.forEach((element) => {
    final.push({
      loaiItems: element,
      maLoai: element[0]["MÃ LOẠI"],
      typeName: element[0]["TYPE NAME"],
      tenLoai: element[0]["TÊN LOẠI"],
    });
  });
  console.log("final", final);
  return final;
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [info, setInfo] = useState("");
  const [groupByType, setGroup] = useState([]);
  const [resultsSearch, setResults] = useState([]);
  const debouncedSearch = useDebounce(searchTerm);
  const dataList = useRef(data);

  const searchData = (dataDebounce) => {
    const toSearch = dataDebounce
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
    const objects = dataList.current;
    const results = objects.filter((obj) =>
      Object.keys(obj).some((key) =>
        obj[key]
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .includes(toSearch)
      )
    );
    return results;
  };

  useEffect(() => {
    if (debouncedSearch) {
      const result = searchData(debouncedSearch);
      if (result.length !== 0) {
        const group = groupByTypeFunc(result);
        setGroup(group);
        return setResults(result);
      } else {
        return setInfo("Không thấy trong database");
      }
    }
  }, [debouncedSearch]);

  return (
    <div className="App">
      <Typography.Title level={2}>ICD-10 Code Lookup</Typography.Title>
      <Typography.Text type="danger">
        Search string must be at least 3 characters
      </Typography.Text>
      <Input.Search
        allowClear
        style={{ marginBottom: "1rem", maxWidth: "1140px" }}
        size="large"
        placeholder="Search: Code, Keyword, Description, ..."
        onChange={(e) => {
          if (
            e.target.value.trim() !== "" &&
            e.target.value.trim().length >= 3
          ) {
            return setSearchTerm(e.target.value);
          } else {
            setInfo("");
            setResults([]);
          }
        }}
      />
      <div style={{ width: "100%", flexBasis: 1 }}>
        {resultsSearch.length !== 0 ? (
          <div
            style={{
              maxWidth: "1140px",
              margin: "0 auto",
              border: "1px solid black",
            }}
          >
            <div className="group-header" style={{ display: "flex" }}>
              <div
                style={{
                  width: "60px",
                  padding: "0 0.5rem",
                  textTransform: "uppercase",
                  textAlign: "center",
                }}
              >
                <strong>type code</strong>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "0 0.75rem",
                  textTransform: "uppercase",
                }}
              >
                <strong>type name </strong>
                <br />
                (Tên loại)
              </div>
            </div>
            <Collapse className="group-items">
              {groupByType &&
                groupByType.map((item, i) => {
                  return (
                    <Collapse.Panel
                      key={i}
                      header={
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              width: "60px",
                              textTransform: "uppercase",
                              padding: "0 0.75rem",
                            }}
                          >
                            <strong>{item.maLoai}</strong>
                          </div>
                          <div
                            style={{
                              flex: "1",
                              padding: "0 0.5rem",
                            }}
                          >
                            <strong>{item.typeName}</strong>
                            <br></br>({item.tenLoai})
                          </div>
                        </div>
                      }
                    >
                      <div>
                        {item.loaiItems.map((data, i) => {
                          return (
                            <div
                              key={i}
                              style={{
                                padding: "0.5rem 0",
                                border: "1px solid #f0f0f0",
                              }}
                            >
                              <div style={{ display: "flex" }}>
                                <div
                                  style={{
                                    width: "60px",
                                    textTransform: "uppercase",
                                    textAlign: "center",
                                  }}
                                >
                                  <strong>{data["MÃ BỆNH"]}</strong>
                                  <br />({data["MÃ BỆNH KHÔNG DẤU"]})
                                </div>
                                <div
                                  style={{
                                    flex: "1",
                                    padding: "0 0.5rem",
                                  }}
                                >
                                  <strong>{data["DISEASE NAME"]}</strong>
                                  <br />({data["TÊN BỆNH"]})
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Collapse.Panel>
                  );
                })}
            </Collapse>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>{info}</div>
        )}
      </div>
      <footer style={{ marginTop: "auto" }}>By Dr.Plus</footer>
    </div>
  );
}

export default App;
