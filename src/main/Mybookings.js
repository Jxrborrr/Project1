import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Chip,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import AccountMenu from "../components/AccountMenu";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3333";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export default function MyBookings() {
  const [bookings, setBookings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const navigate = useNavigate();
  const token = getToken();

  // Fetch bookings on load
  React.useEffect(() => {
    const t = getToken();

    if (!t) {
      setError("Please sign in to view your booking history.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/my-bookings`, {
          headers: {
            Authorization: `Bearer ${t}`,
          },
        });

        const data = await res.json();
        console.log("MY BOOKINGS RESPONSE: ", data);

        if (!res.ok || data.status !== "ok") {
          throw new Error(data.message || "Failed to load bookings.");
        }

        setBookings(data.bookings || []);
      } catch (e) {
        console.error(e);
        setError(e.message || "An error occurred while loading bookings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSignedOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) return;

    const t = getToken();

    try {
      const res = await fetch(`${API_URL}/my-bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
      });

      const data = await res.json();

      if (!res.ok || data.status !== "ok") {
        throw new Error(data.message || "Cancellation failed.");
      }

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      alert("Booking cancelled successfully.");
    } catch (e) {
      alert(e.message || "Failed to cancel booking.");
    }
  };

  return (
    <>
      {/* Header */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: "1px solid #eee" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#0055ff" }}
            >
              Antab
            </Typography>

            <Button
              color="inherit"
              sx={{ fontWeight: "bold", color: "#333" }}
              component={Link}
              to="/hotelbooking"
            >
              HOTEL
            </Button>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {!token ? (
              <>
                <Button
                  variant="outlined"
                  sx={{ color: "#0055ff", borderColor: "#0055ff" }}
                  component={Link}
                  to="/login"
                >
                  Sign in
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#0055ff" }}
                  component={Link}
                  to="/register"
                >
                  Create Account
                </Button>
              </>
            ) : (
              <AccountMenu
                onSignOut={handleSignedOut}
                onMyTrips={() => navigate("/my-trips")}
                onProfile={() => navigate("/profile")}
              />
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          My Trips
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          View all your hotel bookings, prices, and travel dates.
        </Typography>

        {loading && <Typography>Loading bookings...</Typography>}

        {!loading && error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && bookings.length === 0 && (
          <Typography sx={{ mt: 2 }}>
            You have no bookings yet. Start by searching for a hotel.
          </Typography>
        )}

        {/* Booking List */}
        <Stack spacing={2} sx={{ mt: 2 }}>
          {bookings.map((b) => {
            const checkIn = b.check_in ? dayjs(b.check_in) : null;
            const checkOut = b.check_out ? dayjs(b.check_out) : null;

            return (
              <Card key={b.id} sx={{ borderRadius: 3 }}>
                <CardContent>
                  {/* Top Section */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {b.room_name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        Booking No: <b>{b.booking_code || "-"}</b>
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={b.city} color="primary" size="small" />
                        <Chip
                          label={b.room_type}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`${b.rooms} room(s)`}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={`${b.nights} night(s)`}
                          variant="outlined"
                          size="small"
                        />
                      </Stack>
                    </Box>

                    {/* Price */}
                    <Box textAlign="right">
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Price
                      </Typography>
                      <Typography variant="h6">
                        ฿{Number(b.total_price || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ฿{Number(b.price_per_night || 0).toLocaleString()} /
                        night
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Dates + Guests */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="body2">
                        Check-in:{" "}
                        <b>
                          {checkIn
                            ? checkIn.format("DD MMM YYYY HH:mm")
                            : "-"}
                        </b>
                      </Typography>
                      <Typography variant="body2">
                        Check-out:{" "}
                        <b>
                          {checkOut
                            ? checkOut.format("DD MMM YYYY HH:mm")
                            : "-"}
                        </b>
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2">
                        Guests:{" "}
                        <b>
                          {b.adults} adult{b.adults > 1 ? "s" : ""}
                          {b.children > 0
                            ? `, ${b.children} child${
                                b.children > 1 ? "ren" : ""
                              }`
                            : ""}
                        </b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Booked on{" "}
                        {b.created_at
                          ? dayjs(b.created_at).format(
                              "DD MMM YYYY HH:mm"
                            )
                          : "-"}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Cancel Button */}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancelBooking(b.id)}
                  >
                    Cancel Booking
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Container>
    </>
  );
}
