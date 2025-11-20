import React, { useState, useEffect } from "react";
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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3333";

const CITY_PALETTE = {
  Bangkok: { bg: "e0e7ff", fg: "1f2937" },
  Pattaya: { bg: "dcfce7", fg: "14532d" },
  "Chiang Mai": { bg: "fff7ed", fg: "7c2d12" },
  Phuket: { bg: "dbeafe", fg: "1e3a8a" },
  "Hua Hin / Cha-am": { bg: "fef3c7", fg: "78350f" },
};

function generateBookingCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function roomImage(city, templateName, size = "400x225") {
  const { bg, fg } = CITY_PALETTE[city] || { bg: "e5e7eb", fg: "111827" };
  const text = `${templateName} — ${city}`;
  return `https://via.placeholder.com/${size}/${bg}/${fg}?text=${encodeURIComponent(
    text
  )}`;
}

const ROOM_TEMPLATES = [
  {
    name: "Standard Queen",
    type: "Standard",
    beds: 1,
    guests: 2,
    pricePerNight: 1200,
    rating: 4.2,
    amenities: ["Wi-Fi", "A/C", "TV"],
    image: "/images/hotel-std.jpg",
  },
  {
    name: "Deluxe Twin City View",
    type: "Deluxe",
    beds: 2,
    guests: 3,
    pricePerNight: 1950,
    rating: 4.6,
    amenities: ["Wi-Fi", "A/C", "TV", "City view"],
    image: "/images/hotel-dlx.jpg",
  },
  {
    name: "Suite with Kitchenette",
    type: "Suite",
    beds: 2,
    guests: 4,
    pricePerNight: 5200,
    rating: 4.8,
    amenities: ["Wi-Fi", "A/C", "TV", "Kitchenette", "Workspace"],
    image: "/images/hotel-ste.jpg",
  },
  {
    name: "Family Suite",
    type: "Family",
    beds: 3,
    guests: 5,
    pricePerNight: 4500,
    rating: 4.7,
    amenities: ["Wi-Fi", "A/C", "TV", "Living room", "Mini fridge"],
    image: "/images/hotel-fam.jpg",
  },
];

const TEMPLATE_BY_TYPE = ROOM_TEMPLATES.reduce((acc, t) => {
  acc[t.type.toLowerCase()] = t;
  return acc;
}, {});

const CITIES = [
  "Bangkok",
  "Pattaya",
  "Chiang Mai",
  "Phuket",
  "Hua Hin / Cha-am",
];

const ROOMS = CITIES.flatMap((city, ci) =>
  ROOM_TEMPLATES.map((t, ri) => ({
    id: ci * 100 + ri + 1,
    name: t.name,
    type: t.type,
    beds: t.beds,
    guests: t.guests,
    pricePerNight: t.pricePerNight,
    rating: t.rating,
    amenities: t.amenities,
    image: t.image ? t.image : roomImage(city, t.name),
    city,
  }))
);

const DESTINATIONS = [
  { name: "Bangkok", image: "/images/top-bk.jpg" },
  { name: "Pattaya", image: "/images/top-pty.jpg" },
  { name: "Chiang Mai", image: "/images/top-cm.jpg" },
  { name: "Phuket", image: "/images/top-pk.jpg" },
  { name: "Hua Hin / Cha-am", image: "/images/top-hh.jpg" },
];

const ROOM_TYPES_UNIQUE = Array.from(
  new Map(ROOM_TEMPLATES.map((t) => [t.type.toLowerCase(), t])).values()
);

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
  const [hasSearched, setHasSearched] = React.useState(false);

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const handleGuestClick = (event) => setAnchorEl(event.currentTarget);
  const handleGuestClose = () => setAnchorEl(null);

  const openGuestPopover = Boolean(anchorEl);
  const guestPopoverId = openGuestPopover ? "guest-popover" : undefined;

  const navigate = useNavigate();

  const [results, setResults] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [availableRooms, setAvailableRooms] = React.useState([]);

  useEffect(() => {
    const loadRoomsFromDB = async () => {
      try {
        const res = await fetch(`${API_URL}/rooms`);
        const data = await res.json();

        console.log("Rooms from DB raw:", data);

        if (res.ok && data.status === "ok") {
          const enriched = (data.rooms || []).map((r) => {
            const rawType = (r.room_type || r.type || "").toString().trim();
            const rawTypeLower = rawType.toLowerCase();

            let typeKey = "";
            if (rawTypeLower.includes("presidential")) typeKey = "presidential";
            else if (rawTypeLower.includes("family")) typeKey = "family";
            else if (rawTypeLower.includes("deluxe")) typeKey = "deluxe";
            else if (rawTypeLower.includes("suite")) typeKey = "suite";
            else if (rawTypeLower.includes("standard")) typeKey = "standard";
            else typeKey = rawTypeLower;

            const template = TEMPLATE_BY_TYPE[typeKey] || null;

            const imageByType = {
              standard: "/images/hotel-std.jpg",
              deluxe: "/images/hotel-dlx.jpg",
              suite: "/images/hotel-ste.jpg",
              family: "/images/hotel-fam.jpg",
              presidential: "/images/hotel-ste.jpg",
            };

            const displayName =
              template?.name ||
              rawType ||
              `Room ${r.room_number || r.id}`;

            const priceFromDB = Number(
              r.price_per_night ?? r.pricePerNight ?? r.price_perNight
            );

            const pricePerNight =
              !Number.isNaN(priceFromDB) && priceFromDB > 0
                ? priceFromDB
                : template?.pricePerNight || 0;

            return {
              id: r.id,
              roomId: r.id,
              roomNumber: r.room_number || r.name || r.id,
              name: displayName,
              type: template?.type || rawType || "Room",
              city: r.city,
              pricePerNight,
              guests: template?.guests ?? 2,
              beds: template?.beds ?? 1,
              amenities: template?.amenities ?? [],
              image: template?.image || imageByType[typeKey] || "/images/hotel-std.jpg",
              total_rooms: r.total_rooms ?? r.totalRooms ?? 1,
              status: r.status || "available",
            };
          });

          console.log("Rooms enriched:", enriched);
          setAvailableRooms(enriched);
        } else {
          setAvailableRooms([]);
        }
      } catch (err) {
        console.error("Load rooms error:", err);
        setAvailableRooms([]);
      }
    };

    loadRoomsFromDB();
  }, []);

  // Checkout dialog
  const [checkoutData, setCheckoutData] = React.useState(null);
  const [includeBreakfast, setIncludeBreakfast] = React.useState(false);
  const BREAKFAST_PRICE = 180;

  const nights =
    checkIn && checkOut
      ? Math.max(dayjs(checkOut).diff(dayjs(checkIn), "day"), 0)
      : 0;

  const onSearch = (e) => {
    if (e?.preventDefault) e.preventDefault();

    const nightsSelected =
      checkIn && checkOut ? dayjs(checkOut).diff(dayjs(checkIn), "day") : 0;
    if (checkIn && checkOut && nightsSelected <= 0) {
      alert("Please select a valid date range (check-out after check-in).");
      return;
    }

    const requiredGuests = adults + children;
    const q = normalize(destination);


    const sourceRooms =
      availableRooms && availableRooms.length > 0 ? availableRooms : ROOMS;


    const normalizedRooms = sourceRooms.map((r) => {
      const priceRaw =
        r.pricePerNight !== undefined
          ? r.pricePerNight
          : r.price_per_night !== undefined
            ? r.price_per_night
            : 0;

      const price = parseFloat(priceRaw) || 0;
      const typeText = (r.type || r.room_type || "").toLowerCase();


      const tpl =
        TEMPLATE_BY_TYPE[typeText] ||
        TEMPLATE_BY_TYPE[(r.room_type || "").toLowerCase()] ||
        TEMPLATE_BY_TYPE[(r.name || "").toLowerCase()] ||
        null;


      const img =
        r.image ||
        tpl?.image ||
        roomImage(
          r.city || "",
          tpl?.name || r.name || r.room_type || "Room"
        );

      return {
        ...r,
        image: img,
        pricePerNight: price,
        _typeNorm: typeText,
        _cityNorm: normalize(r.city || ""),
        _nameNorm: normalize(r.name || r.room_name || r.roomNumber || ""),
        guests: r.guests ?? tpl?.guests ?? 2,
        beds: r.beds ?? tpl?.beds ?? 1,
        amenities: r.amenities ?? tpl?.amenities ?? [],
      };
    });


    const filtered = normalizedRooms.filter((r) => {
      const matchesBudget = r.pricePerNight <= maxBudget;

      const matchesType =
        roomType === "any" ||
        r._typeNorm === roomType.toLowerCase() ||
        (roomType === "presidential" &&
          r._nameNorm.includes("presidential"));

      const matchesGuests = r.guests * rooms >= requiredGuests;
      const matchesDestination =
        !q || r._cityNorm.includes(q) || r._nameNorm.includes(q);

      return (
        matchesBudget &&
        matchesType &&
        matchesGuests &&
        matchesDestination
      );
    });

    console.log("Filtered rooms:", filtered.length, filtered);

    setHasSearched(true);
    setResults(filtered);

    document
      .getElementById("results-start")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (hasSearched)
      onSearch();
  }, [roomType, maxBudget, adults, children, rooms]);

  const handleSignedOut = () => {
    navigate("/login", { replace: true });
  };

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");


  const pax = (checkoutData?.adults || 0) + (checkoutData?.children || 0);
  const breakfastTotal =
    includeBreakfast && checkoutData
      ? pax * (checkoutData.nights || 0) * BREAKFAST_PRICE
      : 0;
  const grandTotal =
    (checkoutData?.pricePerNight || 0) *
    (checkoutData?.nights || 0) *
    (checkoutData?.rooms || 0) +
    breakfastTotal;

  const saveBookingToDB = async () => {
    if (!checkoutData) return;

    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          roomId: checkoutData.roomId,
          roomName: checkoutData.roomName,
          city: checkoutData.city,
          type: checkoutData.type,
          roomType: checkoutData.type,
          pricePerNight: checkoutData.pricePerNight,
          rooms: checkoutData.rooms,
          nights: checkoutData.nights,
          checkIn: checkoutData.checkIn,
          checkOut: checkoutData.checkOut,
          adults: checkoutData.adults,
          children: checkoutData.children,
          totalPrice: grandTotal,
          booking_code: checkoutData.bookingCode,
        }),
      });

      const data = await res.json();

      if (data.status === "full") {
        alert("This room is fully booked for the selected dates.");
        return null;
      }

      if (!res.ok || data.status !== "ok") {
        console.error("Booking error:", data);
        alert(data.message || "Failed to save booking");
        return null;
      }

      console.log("Booking saved:", data);
      return data;

    } catch (err) {
      console.error(err);
      alert("Failed to save booking");
      throw err;
    }
  };


  const handleConfirmPayment = async () => {
    try {
      await saveBookingToDB();
      alert("บันทึกการจองเรียบร้อยแล้ว");
      setCheckoutData(null);

    } catch (err) {

    }
  };

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
              Antab
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
                onAdmin={() => navigate("/admin/bookings")}
              />
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {/* --- Hero & Search --- */}
      <Box
        sx={{
          backgroundImage: 'url("/images/hotel-bg.jpg")',
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
        <Typography
          variant="h4"
          component="h1"
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          SEE THE WORLD FOR LESS
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
                        <SearchIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
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
                    textField: {
                      fullWidth: true,
                      sx: { bgcolor: "#f5f5f5" },
                    },
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
                    textField: {
                      fullWidth: true,
                      sx: { bgcolor: "#f5f5f5" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  id="guest-input-field"
                  label="Guests & Rooms"
                  value={`${adults} adult${adults > 1 ? "s" : ""
                    }${children > 0 ? `, ${children} child${children > 1 ? "ren" : ""}` : ""
                    }, ${rooms} room${rooms > 1 ? "s" : ""}`}
                  fullWidth
                  variant="outlined"
                  sx={{ bgcolor: "#f5f5f5" }}
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
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
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
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
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      setRooms(Math.max(1, rooms - 1))
                    }
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
                  <IconButton
                    size="small"
                    onClick={() => setRooms(rooms + 1)}
                  >
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Ages 18 or above
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      setAdults(Math.max(1, adults - 1))
                    }
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Ages 0–17
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <IconButton
                    size="small"
                    onClick={() =>
                      setChildren(Math.max(0, children - 1))
                    }
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
                    onClick={() =>
                      setChildren(children + 1)
                    }
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleGuestClose}
                >
                  Done
                </Button>
              </Box>
            </Stack>
          </Popover>
        </Paper>
      </Box>

      {/* --- Content --- */}
      <Container id="results-start" maxWidth="lg" sx={{ py: 4 }}>
        {/* Top Destinations */}
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          DESTINATIONS
        </Typography>

        <Grid container spacing={3} columns={20}>
          {DESTINATIONS.map((dest) => (
            <Grid item xs={10} sm={6} md={4} lg={4} key={dest.name}>
              <CardActionArea
                sx={{ borderRadius: 2, overflow: "hidden" }}
              >
                <Card sx={{ borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="150"
                    image={dest.image}
                    alt={dest.name}
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/150/e5e7eb/111827?text=${encodeURIComponent(
                        dest.name
                      )}`;
                    }}
                  />
                  <CardContent sx={{ p: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      textAlign="center"
                    >
                      {dest.name}
                    </Typography>
                  </CardContent>
                </Card>
              </CardActionArea>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* BEFORE SEARCH: show only room types */}
        {!hasSearched && (
          <>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              Room types
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              เลือกพิมพ์ห้องที่สนใจ หรือกรอกด้านบนแล้วกด Search
              เพื่อดูห้องว่างจริง
            </Typography>
            <Grid container spacing={3} alignItems="stretch">
              {ROOM_TYPES_UNIQUE.map((t) => (
                <Grid item xs={12} sm={6} md={4} key={t.type}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={t.image}
                      sx={{
                        height: 200,
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography variant="h6">{t.name}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={t.type} size="small" color="primary" />
                        <Chip
                          label={`Up to ${t.guests} guests`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* AFTER SEARCH: filters + results */}
        {hasSearched && (
          <Grid container spacing={3} sx={{ mt: 0 }}>
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
                    <InputLabel id="room-type-label">
                      Room Type
                    </InputLabel>
                    <Select
                      labelId="room-type-label"
                      value={roomType}
                      label="Room Type"
                      onChange={(e) =>
                        setRoomType(e.target.value)
                      }
                    >
                      <MenuItem value="any">Any</MenuItem>
                      <MenuItem value="standard">Standard</MenuItem>
                      <MenuItem value="deluxe">Deluxe</MenuItem>
                      <MenuItem value="suite">Suite</MenuItem>
                      <MenuItem value="family">Family</MenuItem>
                      <MenuItem value="presidential">Presidential</MenuItem>
                    </Select>
                  </FormControl>

                  <Typography
                    variant="body2"
                    sx={{ mb: 1, mt: 3 }}
                  >
                    Max budget (฿/night)
                  </Typography>
                  <Slider
                    value={maxBudget}
                    onChange={(_, v) => setMaxBudget(v)}
                    valueLabelDisplay="auto"
                    step={100}
                    min={500}
                    max={15000}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
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
                      No rooms match your filters. Try raising the
                      budget or changing room type.
                    </Typography>
                  </Paper>
                )}

                <Stack spacing={2}>
                  {results.length === 0 && (
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography>
                        No rooms match your filters. Try raising the
                        budget or changing room type.
                      </Typography>
                    </Paper>
                  )}

                  {results.map((room) => (
                    <Card
                      key={room.id}
                      sx={{
                        borderRadius: 3,
                        overflow: "hidden",
                        cursor: "pointer",
                        display: "flex",
                      }}
                      onClick={() => setSelected(room)}
                    >
                      {/* ซ้าย: รูปห้อง (กรอบเท่ากันทุกใบ) */}
                      <Box
                        sx={{
                          width: 260,          // ความกว้างคอลัมน์รูป
                          flexShrink: 0,
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={room.image}
                          alt={room.name}
                          sx={{
                            width: "100%",
                            height: 180,        // ★ กรอบรูปสูงเท่ากันทุกใบ
                            objectFit: "cover",
                          }}
                        />
                      </Box>

                      {/* ขวา: เนื้อหา + ปุ่ม */}
                      <Box
                        sx={{
                          flex: 1,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          minHeight: 180,       // ★ ให้คอลัมน์ขวาไม่น้อยกว่ารูป
                        }}
                      >
                        {/* ชื่อ + subtext */}
                        <Box>
                          <Typography variant="h6">{room.name}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {room.type} • up to {room.guests} guests • {room.beds} bed(s) •{" "}
                            {room.city}
                          </Typography>

                          {/* chips */}
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip label={room.city} color="primary" size="small" />
                            {(room.amenities || []).map((a) => (
                              <Chip
                                key={a}
                                label={a}
                                variant="outlined"
                                size="small"
                              />
                            ))}
                          </Stack>
                        </Box>

                        {/* ดันให้ส่วนล่างไปติดขอบล่างเสมอ */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* ราคา + ปุ่ม (ตำแหน่งเท่ากันทุกรายการ) */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="h6">
                            ฿
                            {Number(
                              room.pricePerNight ?? room.price_per_night ?? 0
                            ).toLocaleString()}{" "}
                            <Typography component="span" variant="caption">
                              /night
                            </Typography>
                          </Typography>

                          <Button
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation(); // กันไม่ให้ไป trigger onClick การ์ด
                              setSelected(room);
                            }}
                          >
                            SELECT
                          </Button>
                        </Stack>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Quick details dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
      >
        {selected && (
          <>
            <DialogTitle>
              {selected.name} — {selected.city}
            </DialogTitle>
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
                  <Typography gutterBottom>
                    Type: {selected.type}
                  </Typography>

                  <Typography gutterBottom>
                    City: {selected.city}
                  </Typography>
                  <Typography gutterBottom>
                    Fits up to {selected.guests} guests •{" "}
                    {selected.beds} bed(s)
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ my: 1 }}
                  >
                    {(selected.amenities || []).map((a) => (
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
                    alert(
                      "Please select check-in and check-out dates"
                    );
                    return;
                  }
                  const code = generateBookingCode();
                  const checkInISO = checkIn
                    ? dayjs(checkIn)
                      .hour(14)
                      .minute(0)
                      .second(0)
                      .millisecond(0)
                      .format("YYYY-MM-DD HH:mm:ss")
                    : null;

                  const checkOutISO = checkOut
                    ? dayjs(checkOut)
                      .hour(12)
                      .minute(0)
                      .second(0)
                      .millisecond(0)
                      .format("YYYY-MM-DD HH:mm:ss")
                    : null;

                  setIncludeBreakfast(false);
                  setCheckoutData({
                    roomId: selected.id,
                    roomName: selected.name,
                    city: selected.city,
                    type: selected.type,
                    pricePerNight: selected.pricePerNight,
                    guests: selected.guests,
                    rooms,
                    nights,
                    checkIn: checkInISO,
                    checkOut: checkOutISO,
                    image: selected.image,
                    adults,
                    children,
                    bookingCode: code,
                  });
                  setSelected(null);
                }}
              >
                Book now
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Checkout dialog */}
      <Dialog
        open={!!checkoutData}
        onClose={() => setCheckoutData(null)}
        maxWidth="lg"
        fullWidth
      >
        {checkoutData && (
          <>
            <DialogTitle>ชำระเงิน (Checkout)</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* ซ้าย: สรุปการจอง */}
                <Grid item xs={12} md={7}>
                  <Card
                    sx={{ borderRadius: 3, overflow: "hidden" }}
                  >
                    <Grid container>
                      <Grid item xs={12} md={5}>
                        <CardMedia
                          component="img"
                          image={checkoutData.image}
                          alt={checkoutData.roomName}
                          height={220}
                        />
                      </Grid>
                      <Grid item xs={12} md={7}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                          >
                            {checkoutData.roomName} —{" "}
                            {checkoutData.city}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Booking No: <b>{checkoutData.bookingCode}</b>
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mb: 1 }}
                          >
                            <Chip
                              label={checkoutData.type}
                              size="small"
                            />
                            <Chip
                              label={`${checkoutData.guests} guests (room capacity)`}
                              size="small"
                            />
                            <Chip
                              label={`${(checkoutData.adults || 0) +
                                (checkoutData.children || 0)
                                } pax`}
                              size="small"
                            />
                            <Chip
                              label={`${checkoutData.rooms} room(s)`}
                              size="small"
                            />
                            <Chip
                              label={`${checkoutData.nights} night(s)`}
                              size="small"
                            />
                          </Stack>

                          <Typography>
                            Check-in:{" "}
                            <b>
                              {checkoutData.checkIn
                                ? dayjs(
                                  checkoutData.checkIn
                                ).format("DD MMM YYYY")
                                : "-"}
                            </b>
                          </Typography>
                          <Typography sx={{ mb: 1 }}>
                            Check-out:{" "}
                            <b>
                              {checkoutData.checkOut
                                ? dayjs(
                                  checkoutData.checkOut
                                ).format("DD MMM YYYY")
                                : "-"}
                            </b>
                          </Typography>

                          <Divider sx={{ my: 1.5 }} />

                          {/* บรรทัดสรุปราคาแบบแยกส่วน */}
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              ห้องพัก: ฿
                              {checkoutData.pricePerNight.toLocaleString()}{" "}
                              × {checkoutData.nights} คืน ×{" "}
                              {checkoutData.rooms} ห้อง
                            </Typography>
                            {includeBreakfast && (
                              <Typography variant="body2">
                                อาหารเช้า: ฿
                                {BREAKFAST_PRICE.toLocaleString()} ×{" "}
                                {(checkoutData.adults || 0) +
                                  (checkoutData.children || 0)}{" "}
                                คน × {checkoutData.nights} คืน = ฿
                                {(
                                  ((checkoutData.adults || 0) +
                                    (checkoutData.children ||
                                      0)) *
                                  (checkoutData.nights || 0) *
                                  BREAKFAST_PRICE
                                ).toLocaleString()}
                              </Typography>
                            )}
                          </Stack>

                          <Typography
                            variant="h6"
                            sx={{ mt: 1 }}
                          >
                            Total:{" "}
                            <b>฿{grandTotal.toLocaleString()}</b>
                          </Typography>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                {/* ขวา: ตัวเลือกอาหารเช้า + QR + อัปโหลดสลิป */}
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    {/* ตัวเลือกอาหารเช้า */}
                    <Box sx={{ mb: 2 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 0.5 }}
                      >
                        <input
                          id="breakfast-checkbox"
                          type="checkbox"
                          checked={includeBreakfast}
                          onChange={(e) =>
                            setIncludeBreakfast(
                              e.target.checked
                            )
                          }
                          style={{ width: 18, height: 18 }}
                        />
                        <Typography
                          component="label"
                          htmlFor="breakfast-checkbox"
                          sx={{ cursor: "pointer" }}
                        >
                          เพิ่มอาหารเช้า (฿
                          {BREAKFAST_PRICE.toLocaleString()}
                          /คน/คืน)
                        </Typography>
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        ผู้เข้าพัก{" "}
                        {(checkoutData.adults || 0) +
                          (checkoutData.children || 0)}{" "}
                        คน × {checkoutData.nights} คืน = ฿
                        {(
                          ((checkoutData.adults || 0) +
                            (checkoutData.children || 0)) *
                          (checkoutData.nights || 0) *
                          BREAKFAST_PRICE
                        ).toLocaleString()}{" "}
                        (ถ้าเลือก)
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      สแกน QR ด้านล่างเพื่อชำระเงินตามยอด รวม{" "}
                      <b>฿{grandTotal.toLocaleString()}</b>
                    </Typography>

                    {/* พื้นที่ QR (ตอนนี้ placeholder) */}
                    <Box
                      sx={{
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 2,
                        textAlign: "center",
                        mb: 2,
                      }}
                    >
                      <img
                        src={`https://via.placeholder.com/240x240?text=${encodeURIComponent(
                          "Scan QR to Pay"
                        )}`}
                        alt="QR Code"
                        width={240}
                        height={240}
                        style={{ borderRadius: 12 }}
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1 }}
                      >
                        * นำภาพ QR จริงมาแปะแทนได้ เช่น
                        /images/qr.png
                      </Typography>
                    </Box>

                    {/* อัปโหลดสลิป/หลักฐานการโอน */}
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1 }}
                    >
                      อัปโหลดสลิปโอนเงิน (ถ้ามี)
                    </Typography>
                    <TextField
                      type="file"
                      fullWidth
                      inputProps={{
                        accept: "image/*,application/pdf",
                      }}
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      label="หมายเหตุ (เช่น เลขผู้จอง / เบอร์ติดต่อ)"
                      fullWidth
                      multiline
                      minRows={2}
                      sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        onClick={async () => {
                          try {
                            await saveBookingToDB();
                            alert("เราได้รับข้อมูลการชำระเงินแล้ว ขอบคุณค่ะ/ครับ");
                            setCheckoutData(null);
                            navigate("/", { replace: true });
                          } catch (e) {
                          }
                        }}
                      >
                        ยืนยันการชำระเงิน
                      </Button>

                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCheckoutData(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </LocalizationProvider>
  );
}
