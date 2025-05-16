
const EventsCarousel = () => {
  const events = [
    {
      id: 1,
      title: "Board Game Marathon",
      image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09",
      date: "30.05.2025 15:00",
      price: "1 €",
      organizer: "Play Berlin",
      location: "GameOn Cafe",
      description: "Join fellow board game lovers for a marathon of classics and new hits."
    },
    {
      id: 2,
      title: "After Party by Jägermeister",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      date: "12.05.2025 22:00",
      price: "4 €",
      organizer: "Jägermeister",
      location: "Arena Berlin",
      description: "Exclusive after party with live DJs, neon lights, and drinks. Join the fun!"
    },
    {
      id: 3,
      title: "Berlin Coffee Festival",
      image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      date: "20.05.2025 10:00",
      price: "2 €",
      organizer: "Berlin Cafes",
      location: "Kulturbrauerei",
      description: "Taste the best coffee in the city and meet local roasters. Free samples!"
    },
    {
      id: 4,
      title: "Vegan Brunch Meetup",
      image: "https://images.unsplash.com/photo-1608241175281-722a1c6111be",
      date: "25.05.2025 12:00",
      price: "5 €",
      organizer: "Green Eats",
      location: "Cafe Mint",
      description: "A friendly vegan brunch with friends!"
    },
    {
      id: 5,
      title: "Urban Spree Art Exhibition",
      image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5",
      date: "15.05.2025 18:00",
      price: "3 €",
      organizer: "Urban Spree Gallery",
      location: "Friedrichshain",
      description: "Contemporary art in a relaxed, creative atmosphere."
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-center">Upcoming Events</h2>
        <p className="text-gray-600 mb-8 text-center">
          Join our community events and earn AntiCoins while connecting with fellow focus enthusiasts
        </p>
        
        <h3 className="text-xl font-semibold mb-6 text-center">Events & Happenings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {events.map((event) => (
            <div key={event.id} className="cafe-card min-w-[280px]">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                  {event.price}
                </div>
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  {event.date}
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="text-lg font-semibold mb-1">{event.title}</h4>
                <p className="text-sm text-gray-500 mb-2">By {event.organizer} @ {event.location}</p>
                <p className="text-sm text-gray-600 mb-4">{event.description}</p>
                <button className="w-full py-2 border border-antiapp-purple text-antiapp-purple rounded-lg hover:bg-antiapp-purple/10 transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-antiapp-purple' : 'bg-gray-300'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsCarousel;
