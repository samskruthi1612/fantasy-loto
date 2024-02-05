import './PageNavigation.css'
import {useState, useEffect} from 'react'
import { DropdownV2 } from '../../elements/dropdownV2/DropDownV2'
import { ReactComponent as NextPage } from "../../resources/next_page.svg";
import { ReactComponent as PreviousPage } from "../../resources/previous_page.svg";

export const PageNavigation = ({dataLoading, rowsPerPage, setRowsPerPage, pageNum, setPageNum, currentDataLength, moreRecordsIndicator}) => {
    return (
      <div className="manualWinPagesRow">
            <div>Rows per page</div>
            <DropdownV2
              style={{ width: "56px", height: "32px", padding: "8px" }}
              label=""
              currentLabel={rowsPerPage}
              options={[
                { label: 10, value: 10 },
                { label: 15, value: 15 },
                { label: 20, value: 20 },
              ]}
              onChange={(val) => {
                setRowsPerPage(val);
              }}
            />
            {pageNum > 0 && (
              <>
                <div
                  className="pageNavigationButton clickable"
                  onClick={() => setPageNum((page) => page - 1)}
                >
                  <PreviousPage />
                </div>
                <div style={{ marginTop: "auto" }}>...</div>
              </>
            )}
            <div
              className="pageNavigationButton clickable"
              onClick={() => setPageNum(pageNum)}
            >
              {pageNum + 1}
            </div>
            {((rowsPerPage*(pageNum+1)<currentDataLength) || moreRecordsIndicator) && (
              <>
                <div style={{ marginTop: "auto" }}>...</div>
                <div
                  className="pageNavigationButton clickable"
                  onClick={() => {
                    if(!dataLoading) {
                      setPageNum((page) => page + 1)
                    }
                  }}
                >
                  <NextPage />
                </div>
              </>
            )}
          </div>
    )
  }