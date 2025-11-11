import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CardHeader,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Popover,
  InputAdornment,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import { Link, useNavigate } from "react-router-dom";
import AccountMenu from "../components/AccountMenu";

// --- Mock inventory (replace with API later) ---
const ROOMS = [
  {
    id: 1,
    name: "Standard Queen",
    type: "Standard",
    beds: 1,
    guests: 2,
    pricePerNight: 1200,
    rating: 4.2,
    amenities: ["Wi-Fi", "A/C", "TV"],
    image: "https://via.placeholder.com/400x225/dcfce7/14532d?text=Deluxe+Twin",
    city: "Bangkok",
  },
  {
    id: 2,
    name: "Deluxe Twin City View",
    type: "Deluxe",
    beds: 2,
    guests: 3,
    pricePerNight: 1950,
    rating: 4.6,
    amenities: ["Wi-Fi", "A/C", "TV", "City view"],
    image:
      "https://via.placeholder.com/400x225/dcfce7/14532d?text=Deluxe+Twin",
    city: "Bangkok",
  },
  {
    id: 3,
    name: "Suite with Kitchenette",
    type: "Suite",
    beds: 2,
    guests: 4,
    pricePerNight: 3200,
    rating: 4.8,
    amenities: ["Wi-Fi", "A/C", "TV", "Kitchenette", "Workspace"],
    image:
      "https://via.placeholder.com/400x225/fff7ed/7c2d12?text=Suite+Kitchenette",
    city: "Chiang Mai",
  },
];

const DESTINATIONS = [
  { name: "Bangkok", image: "/image/bangkok.jpg" },
];

function NightsBadge({ checkIn, checkOut }) {
  const nights =
    checkIn && checkOut ? dayjs(checkOut).diff(dayjs(checkIn), "day") : 0;
  if (nights <= 0) return null;
  return (
    <Chip
      label={`${nights} night${nights > 1 ? "s" : ""}`}
      size="small"
      variant="outlined"
      icon={<NightsStayIcon />}
      sx={{
        color: "white",
        borderColor: "rgba(255,255,255,0.7)",
        bgcolor: "rgba(0,0,0,0.2)",
      }}
    />
  );
}

export default function HotelBookingTemplate() {
  // Filters / form state
  const [destination, setDestination] = React.useState("");
  const [checkIn, setCheckIn] = React.useState(null);
  const [checkOut, setCheckOut] = React.useState(null);
  const [adults, setAdults] = React.useState(2);
  const [children, setChildren] = React.useState(0);
  const [rooms, setRooms] = React.useState(1);
  const [roomType, setRoomType] = React.useState("any");
  const [maxBudget, setMaxBudget] = React.useState(4000);
  const [activeTab, setActiveTab] = React.useState("Hotels");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const handleGuestClick = (event) => setAnchorEl(event.currentTarget);
  const handleGuestClose = () => setAnchorEl(null);

  const openGuestPopover = Boolean(anchorEl);
  const guestPopoverId = openGuestPopover ? "guest-popover" : undefined;

  const navigate = useNavigate();

  const [results, setResults] = React.useState(ROOMS);
  const [selected, setSelected] = React.useState(null);

  const nights =
    checkIn && checkOut
      ? Math.max(dayjs(checkOut).diff(dayjs(checkIn), "day"), 0)
      : 0;

  const onSearch = (e) => {
    e?.preventDefault?.();

    const nightsSelected =
      checkIn && checkOut ? dayjs(checkOut).diff(dayjs(checkIn), "day") : 0;
    if (checkIn && checkOut && nightsSelected <= 0) {
      alert("Please select a valid date range (check-out after check-in).");
      return;
    }

    let filtered = [...ROOMS];

    filtered = filtered.filter((r) => r.pricePerNight <= maxBudget);

    if (roomType !== "any") {
      filtered = filtered.filter(
        (r) => r.type.toLowerCase() === roomType.toLowerCase()
      );
    }

    const requiredGuests = adults + children;
    filtered = filtered.filter((r) => r.guests * rooms >= requiredGuests);

    const q = normalize(destination);
    if (q) {
      filtered = filtered.filter(
        (r) => normalize(r.city).includes(q) || normalize(r.name).includes(q)
      );
    }

    setResults(filtered);

    document.getElementById("results-start")?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomType, maxBudget, adults, children, rooms]);

  const total =
    selected && nights > 0 ? selected.pricePerNight * nights * rooms : 0;

  const handleSignedOut = () => {
    navigate("/login", { replace: true });
  };

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* --- Header --- */}
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
              component="div"
              sx={{ fontWeight: "bold", color: "#0055ff" }}
            >
              GOGO
            </Typography>
            <Button
              color="inherit"
              sx={{ fontWeight: "bold", color: "#333" }}
              component={Link}
              to="/hotelbooking"
            >
              Hotel
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
                  CREATE ACCOUNT
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

      {/* --- Hero & Search --- */}
      <Box
        sx={{
          backgroundImage: `url(https://cdn6.agoda.net/images/MM_DesktopHero_20240313.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pt: 4,
          pb: 10,
          position: "relative",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 1 }}>
          SEE THE WORLD FOR LESS
        </Typography>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Hotels, flights, and more for your perfect trip.
        </Typography>

        <NightsBadge checkIn={checkIn} checkOut={checkOut} />

        {/* Tabs */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            width: "fit-content",
            mx: "auto",
            mt: 2,
            mb: 2,
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
          }}
        >
          <Button
            sx={{
              px: 3,
              py: 1.5,
              color: activeTab === "Hotels" ? "#0055ff" : "#666",
              bgcolor: activeTab === "Hotels" ? "#e0e7ff" : "transparent",
            }}
            onClick={() => setActiveTab("Hotels")}
          >
            Hotels
          </Button>
        </Paper>

        {/* Search Widget */}
        <Paper
          elevation={6}
          sx={{
            p: 3,
            borderRadius: 4,
            width: "90%",
            maxWidth: "1000px",
            mx: "auto",
            bgcolor: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <Box component="form" onSubmit={onSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  label="Enter a destination or property"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Check-in"
                  value={checkIn}
                  onChange={setCheckIn}
                  slotProps={{
                    textField: { fullWidth: true, sx: { bgcolor: "#f5f5f5" } },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Check-out"
                  value={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn}
                  slotProps={{
                    textField: { fullWidth: true, sx: { bgcolor: "#f5f5f5" } },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  id="guest-input-field"
                  label="Guests & Rooms"
                  value={`${adults} adult${adults > 1 ? "s" : ""}${children > 0
                    ? `, ${children} child${children > 1 ? "ren" : ""}`
                    : ""
                    }, ${rooms} room${rooms > 1 ? "s" : ""}`}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5" }}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  }}
                  onClick={handleGuestClick}
                  aria-describedby={guestPopoverId}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    height: 56,
                    bgcolor: "#0055ff",
                    "&:hover": { bgcolor: "#0044cc" },
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Popover
            id={guestPopoverId}
            open={openGuestPopover}
            anchorEl={anchorEl}
            onClose={handleGuestClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              style: {
                width: anchorEl ? anchorEl.clientWidth : "auto",
                padding: 16,
                marginTop: 8,
              },
            }}
          >
            <Stack spacing={2}>
              {/* Rooms Counter */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="body1" fontWeight={500}>
                  Room
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    disabled={rooms <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{ minWidth: 20, textAlign: "center" }}
                  >
                    {rooms}
                  </Typography>
                  <IconButton size="small" onClick={() => setRooms(rooms + 1)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Adults Counter */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Adults
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ages 18 or above
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{ minWidth: 20, textAlign: "center" }}
                  >
                    {adults}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setAdults(adults + 1)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Children Counter */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    Children
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ages 0–17
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{ minWidth: 20, textAlign: "center" }}
                  >
                    {children}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setChildren(children + 1)}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" size="small" onClick={handleGuestClose}>
                  Done
                </Button>
              </Box>
            </Stack>
          </Popover>
        </Paper>
      </Box>

      {/* --- Content --- */}
      <Container id="result-starts" maxWidth="lg" sx={{ py: 4 }}>
        {/* Top Destinations */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Top destinations in Thailand
        </Typography>

        <Grid container spacing={3} columns={20}>
          {DESTINATIONS.map((dest) => (
            <Grid item xs={10} sm={6} md={4} lg={4} key={dest.name}>
              <CardActionArea sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardMedia component="img" height="150" image={dest.image} alt={dest.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        `https://via.placeholder.com/150/e5e7eb/111827?text=${encodeURIComponent(dest.name)}`;
                    }} />
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                      {dest.name}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Results */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                position: "sticky",
                top: 16,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Filter Results
              </Typography>
              <Box component="form" onSubmit={onSearch}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="room-type-label">Room Type</InputLabel>
                  <Select
                    labelId="room-type-label"
                    value={roomType}
                    label="Room Type"
                    onChange={(e) => setRoomType(e.target.value)}
                  >
                    <MenuItem value="any">Any</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="deluxe">Deluxe</MenuItem>
                    <MenuItem value="suite">Suite</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="body2" sx={{ mb: 1, mt: 3 }}>
                  Max budget (฿/night)
                </Typography>
                <Slider
                  value={maxBudget}
                  onChange={(_, v) => setMaxBudget(v)}
                  valueLabelDisplay="auto"
                  step={100}
                  min={500}
                  max={6000}
                />
                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                  Apply Filters
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {results.length === 0 && (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography>
                    No rooms match your filters. Try raising the budget or changing room type.
                  </Typography>
                </Paper>
              )}

              {results.map((room) => (
                <Card key={room.id} sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <CardActionArea onClick={() => setSelected(room)}>
                    <Grid container>
                      <Grid item xs={12} md={4}>
                        <CardMedia component="img" height={180} image={room.image} alt={room.name} />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <CardHeader
                          title={room.name}
                          subheader={`${room.type} • up to ${room.guests} guests • ${room.beds} bed(s)`}
                        />
                        <CardContent>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {room.amenities.map((a) => (
                              <Chip key={a} label={a} variant="outlined" size="small" />
                            ))}
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ mt: 2 }}
                          >
                            <Typography variant="h6">
                              ฿{room.pricePerNight.toLocaleString()}{" "}
                              <Typography component="span" variant="caption">
                                /night
                              </Typography>
                            </Typography>
                            <Button
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelected(room);
                              }}
                            >
                              Select
                            </Button>
                          </Stack>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </CardActionArea>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Quick details dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle>{selected.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selected.image}
                    alt={selected.name}
                    style={{ width: "100%", borderRadius: 12 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Type: {selected.type}</Typography>
                  <Typography gutterBottom>
                    Fits up to {selected.guests} guests • {selected.beds} bed(s)
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ my: 1 }}>
                    {selected.amenities.map((a) => (
                      <Chip key={a} label={a} size="small" />
                    ))}
                  </Stack>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    ฿{selected.pricePerNight.toLocaleString()} / night
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelected(null)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  if (!nights) {
                    alert("Please select check-in and check-out dates");
                    return;
                  }
                  alert(
                    `Booked ${selected.name} for ${nights} night(s), ${rooms} room(s). Total ฿${total.toLocaleString()}`
                  );
                }}
              >
                Book now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </LocalizationProvider>
  );
}
