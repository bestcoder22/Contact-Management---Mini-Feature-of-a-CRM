import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  TableSortLabel,
  Container,
  Typography,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import axios from "axios";

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("firstName");

  // Fetch contacts from the backend
  const fetchContacts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/contacts");
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Open form dialog
  const openDialog = (contact = null) => {
    setCurrentContact(contact);
    setDialogOpen(true);
  };

  // Close form dialog
  const closeDialog = () => {
    setCurrentContact(null);
    setDialogOpen(false);
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const contact = Object.fromEntries(data.entries());

    try {
      if (currentContact) {
        // Update existing contact
        const response = await axios.put(
          `http://localhost:5000/contacts/${currentContact._id}`,
          contact
        );
        setContacts((prev) =>
          prev.map((c) =>
            c._id === currentContact._id ? response.data : c
          )
        );
      } else {
        // Add new contact
        const response = await axios.post(
          "http://localhost:5000/contacts",
          contact
        );
        setContacts((prev) => [...prev, response.data]);
      }
      closeDialog();
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Email already exists");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/contacts/${id}`);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sorting handlers
  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === "asc";
    setOrder(isAscending ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedContacts = () => {
    return [...contacts].sort((a, b) => {
      if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
      if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Paginated and sorted data
  const displayedContacts = sortedContacts().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container sx={{ padding: 3, backgroundColor: "#f9f9f9" }}>
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          marginBottom: 3,
          color: "#333",
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        Contact Management
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => openDialog()}
        sx={{
          marginBottom: 2,
          backgroundColor: "#1976d2",
          ":hover": { backgroundColor: "#1565c0" },
        }}
      >
        Add New Contact
      </Button>

      {/* Contact Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 5,
          borderRadius: 2,
          marginBottom: 3,
          backgroundColor: "#fff",
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="contact table">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2", color: "white" }}>
              {["firstName", "lastName", "email", "phoneNumber", "company", "jobTitle"].map((column) => (
                <TableCell key={column} sx={{ fontWeight: "bold", color: "white" }}>
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? order : "asc"}
                    onClick={() => handleRequestSort(column)}
                  >
                    {column
                      .replace(/([A-Z])/g, " $1") // Split camelCase
                      .replace(/^./, (str) => str.toUpperCase())} {/* Capitalize */}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: "bold", color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedContacts.map((contact) => (
              <TableRow key={contact._id} sx={{ "&:hover": { backgroundColor: "#e8f5e9" } }}>
                <TableCell>{contact.firstName}</TableCell>
                <TableCell>{contact.lastName}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phoneNumber}</TableCell>
                <TableCell>{contact.company}</TableCell>
                <TableCell>{contact.jobTitle}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => openDialog(contact)}
                    sx={{ marginRight: 1, ":hover": { backgroundColor: "#c5cae9" } }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(contact._id)}
                    sx={{ ":hover": { backgroundColor: "#ffcccc" } }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20, 25]}
          component="div"
          count={contacts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ backgroundColor: "#f1f1f1" }}
        />
      </TableContainer>

      {/* Contact Form Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} sx={{ backdropFilter: "blur(3px)" }}>
        <DialogTitle
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            padding: "16px 24px",
            fontWeight: "bold",
          }}
        >
          {currentContact ? "Edit Contact" : "Add Contact"}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent sx={{ padding: 3 }}>
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              defaultValue={currentContact?.firstName || ""}
              required
              margin="dense"
              variant="outlined"
              sx={{
                marginBottom: 2,
                borderRadius: 2,
                backgroundColor: "#f1f1f1",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              defaultValue={currentContact?.lastName || ""}
              required
              margin="dense"
              variant="outlined"
              sx={{
                marginBottom: 2,
                borderRadius: 2,
                backgroundColor: "#f1f1f1",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              defaultValue={currentContact?.email || ""}
              required
              margin="dense"
              variant="outlined"
              sx={{
                marginBottom: 2,
                borderRadius: 2,
                backgroundColor: "#f1f1f1",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            />
            <TextField
              name="phoneNumber"
              label="Phone Number"
              type="tel"
              fullWidth
              defaultValue={currentContact?.phoneNumber || ""}
              required
              margin="dense"
              variant="outlined"
              sx={{
                marginBottom: 2,
                borderRadius: 2,
                backgroundColor: "#f1f1f1",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            />
            <TextField
              name="company"
              label="Company"
              fullWidth
              defaultValue={currentContact?.company || ""}
              margin="dense"
              variant="outlined"
              sx={{
                marginBottom: 2,
                borderRadius: 2,
                backgroundColor: "#f1f1f1",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            />
            <TextField
              name="jobTitle"
              label="Job Title"
              fullWidth
              defaultValue={currentContact?.jobTitle || ""}
              margin="dense"
              variant="outlined"
              sx={{
                marginBottom: 2,
                borderRadius: 2,
                backgroundColor: "#f1f1f1",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ padding: 3 }}>
            <Button onClick={closeDialog} color="secondary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {currentContact ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default App;
