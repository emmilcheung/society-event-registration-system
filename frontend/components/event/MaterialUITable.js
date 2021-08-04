import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit'
import CheckIcon from '@material-ui/icons/Check';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import FilterListIcon from '@material-ui/icons/FilterList';
import { Modal } from '@material-ui/core';
import { Button, FormControl } from '@material-ui/core'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import Statistic from './Statistic';
import Loading from '../Loading';

function createData(sid, name, email, phone, college, major, date, status) {
  return { sid, name, email, phone, college, major, date, status };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name' },
  { id: 'sid', numeric: false, disablePadding: false, label: 'SID' },
  { id: 'email', numeric: false, disablePadding: false, label: 'E-mail' },
  { id: 'phone', numeric: false, disablePadding: false, label: 'Phone No.' },
  { id: 'college', numeric: false, disablePadding: false, label: 'College' },
  { id: 'major', numeric: false, disablePadding: false, label: 'Major' },
  { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
];

const EnhancedTableHead = (props) => {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'default'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, isEditMode, onEditClick, sendEventReminder } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
          {`Applicants of (${props.title})`}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Notify">
            <IconButton aria-label="notify"
              onClick={sendEventReminder}
            >
              <AccessAlarmIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Mode">
            <IconButton aria-label="edit mode"
              onClick={onEditClick}
            >
              {
                isEditMode
                  ? <CheckIcon />
                  : <EditIcon />
              }
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter list">
            <IconButton aria-label="filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

const EnhancedTable = ({ dataArray, title, onTableRowChange, sendEventReminder }) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [isEditMode, setEditMode] = React.useState(false);
  const [statusLoading, setStatusLoading] = React.useState(false);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const rows = dataArray ? dataArray.map(data => {
    return createData(
      data.sid, //sid
      `${data.first_name} ${data.last_name}`,
      data.email,
      data.phone,
      data.college,
      data.major,
      data.registe_date,
      data.check_in === null ? "Enrolled" : "Attended"
    )
  }) : []

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.sid);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, sid) => {
    const selectedIndex = selected.indexOf(sid);
    let newSelected = [];
    if (isEditMode) {
      return;
    }
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, sid);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (sid) => selected.indexOf(sid) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const getSelectedOrder = () => {
    console.log(dataArray);
    return selected.map(sid => {
      return dataArray.filter(data => data.sid === sid)[0]
    })
  }

  const constructExportCSV = (data) => {
    console.log(data);
    var dataStrings = "Name,SID,Email,Phone,College,Major,status\n"
    dataStrings += data.map(order => `${order.first_name} ${order.last_name},${order.sid},${order.email},${order.phone},${order.college},${order.major},${order.check_in === null ? "Enrolled" : "Attended"}`)
      .join("\n")
    console.log(dataStrings);
    return dataStrings
  }

  const exportCSV = () => {
    var selectedOrder = getSelectedOrder()
    if (!selectedOrder.length) return
    const blob = new Blob(["\ufeff", constructExportCSV(selectedOrder)], { type: 'text/csv' })
    const a = document.createElement('a');
    a.setAttribute('hidden', '')
    a.setAttribute('href', window.URL.createObjectURL(blob))
    a.setAttribute('download', 'applicants.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          title={title}
          isEditMode={isEditMode}
          onEditClick={() => setEditMode(!isEditMode)}
          sendEventReminder={sendEventReminder}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.sid);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.sid)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.sid}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell>
                      <TableCell align="left">{row.sid}</TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">{row.phone}</TableCell>
                      <TableCell align="left">{row.college}</TableCell>
                      <TableCell align="left">{row.major}</TableCell>
                      <TableCell align="left">{row.date}</TableCell>
                      {/* depend on isEdit Mode */}
                      {
                        isEditMode
                          ?
                          // is loading or not
                          statusLoading
                            ?
                            <div style={{ display: "block", width: "40px", height: "40px" }}>
                              <Loading />
                            </div>
                            : <Select
                              labelId="demo-customized-select-label"
                              id="demo-customized-select"
                              value={row.status}
                              onChange={async () => {
                                setStatusLoading(true);
                                await onTableRowChange(index, dataArray[index]);
                                setStatusLoading(false);
                              }}
                            >
                              <MenuItem value={"Enrolled"}>Enrolled</MenuItem>
                              <MenuItem value={"Attended"}>Attended</MenuItem>
                            </Select>
                          : <TableCell align="left">{row.status}</TableCell>
                      }
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <div className="table_button"
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />
        <Button
          variant="outlined"
          onClick={exportCSV}
        >download CSV</Button>
      </div>

    </div>
  );
}

export default function TableModal({
  open,
  setOpen,
  dataArray,
  title,
  onTableRowChange,
  sendEventReminder,
}) {

  const [mode, setMode] = React.useState('table');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const body = (
    <div
      style={{
        position: 'absolute',
        color: "var(--card-text)",
        backgroundColor: "var(--card-bg)",
        borderRadius: "max(0px, min(8px, ((100vw - 4px) - 100%) * 9999)) / 8px",
        boxShadow: "var(--shadow-card)",
        width: "min(1800px, 95vw)",
        maxHeight: "95vh",
        overflowX: "scroll",
        overflowY: "scroll",
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`,
        padding: "20px 40px",
      }}>
      <div className="table_container">
        <Button
          onClick={() => setMode('table')}
        >
          Preview
      </Button>

        {
          dataArray &&
          <Button
            onClick={() => setMode('statistic')}
          >
            Statistic
      </Button>
        }
        <div style={{
          display: mode == 'table' ? 'block' : 'none',
        }}>
          <EnhancedTable
            dataArray={dataArray}
            title={title}
            onTableRowChange={onTableRowChange}
            sendEventReminder={sendEventReminder}
          />
        </div>
        <div style={{
          display: mode == 'statistic' ? 'block' : 'none',
        }}>
          {
            dataArray &&
            <Statistic
              dataArray={dataArray}
              title={title}
            />
          }
        </div>
      </div>
    </div>
  );
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}